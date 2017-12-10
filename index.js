// author: anil.uzumcuoglu

const DEBUG = true;

const parser = require('ctl-model-checker/parser');
const BDD = require('./bddv2');
const BDDCoder = require('./bdd-coder');
const utils = require('./utils');

const OR = (l, r) => l | r;
const AND = (l, r) => l & r;

const ModelChecker = function(model){
  this.model = model;
  this.model.variables = this.model.states.reduce(function(set, state){
    state.labels.forEach(label => {
      if (label !== 'NN' && !set.includes(label)) set.push(label);
    });
    return set;
  }, []);
};

ModelChecker.prototype.invert = function(proposition){
  if (proposition.startsWith('!')) return proposition.slice(1);
  return `!${proposition}`;
};

ModelChecker.prototype.solveEX = function(){
  const XPrime = BDDCoder.fromStates(this.model, {
    filter: (state) => state.satisfies(this.model.spec.p),
    satisfies: (state, variable) => state.satisfies(variable.slice(0, -1)),
    variables: this.model.variables.map(v => `${v}'`)
  });
  const T = BDDCoder.fromTransition(this.model);
  return this.extractStates(this.model.variables.reduce(
    (bdd, variable) => bdd.exists(`${variable}'`),
    BDD.apply(T, XPrime, AND)
  ));
};

ModelChecker.prototype.solveEG = function(){
  let X = new BDD({ fn: () => false, variables: this.model.variables });
  let Y = BDDCoder.fromStates(this.model, {
    filter: (state) => state.satisfies(this.model.spec.p)
  });
  const T = BDDCoder.fromTransition(this.model);

  while (!X.equals(Y)) {
    X = Y.clone();
    let YPrime = Y.prime();
    Y = BDD.apply(
      Y,
      this.model.variables.reduce(
        (bdd, variable) => bdd.exists(`${variable}'`),
        BDD.apply(T, YPrime, AND)
      ),
      AND
    );
  }
  return this.extractStates(Y);
};

ModelChecker.prototype.solveEU = function(){
  let X = BDDCoder.fromStates(this.model);
  let Y = BDDCoder.fromStates(this.model, {
    filter: (state) => state.satisfies(this.model.spec.q)
  });

  const W = BDDCoder.fromStates(this.model, {
    filter: (state) => state.satisfies(this.model.spec.p)
  });
  const T = BDDCoder.fromTransition(this.model);

  while (!X.equals(Y)) {
    X = Y.clone();
    let YPrime = Y.prime();
    Y = BDD.apply(
      Y,
      BDD.apply(
        W,
        this.model.variables.reduce(
          (bdd, variable) => bdd.exists(`${variable}'`),
          BDD.apply(T, YPrime, AND)
        ),
        AND
      ),
      OR
    );
  }
  return this.extractStates(Y);
};

ModelChecker.prototype.solveAF = function(){
  this.model.spec.p = this.invert(this.model.spec.p);
  return this.excludeStates(this.solveEG());
};

ModelChecker.prototype.solveAX = function(){
  this.model.spec.p = this.invert(this.model.spec.p);
  return this.excludeStates(this.solveEG());
};

ModelChecker.prototype.solveAG = function(){
  this.model.spec.p = this.invert(this.model.spec.p);
  return this.excludeStates(this.solveEF());
};

ModelChecker.prototype.solveEF = function(){
  this.model.spec.q = this.model.spec.p;
  this.model.spec.p = true;
  return this.solveEU();
};

ModelChecker.prototype.excludeStates = function(states){
  return this.model.states.filter(function(state){
    return states.every(function(targetState){
      return targetState.name !== state.name;
    });
  });
};

ModelChecker.prototype.extractStates = function(solution){
  const satisfyingPaths = [];
  function dfs(node, path){
    if (!node.low) {
      if (node.id) satisfyingPaths.push(path);
    } else {
      dfs(node.high, path.concat(node.variable));
      dfs(node.low, path.concat(`!${node.variable}`));
    }
  }
  dfs(solution.getRoot(), []);
  return this.model.states.filter(function(state){
    return satisfyingPaths.some(function(path){
      return path.every(function(proposition){
        return state.satisfies(proposition);
      });
    });
  });
};

ModelChecker.prototype.solve = function(){
  return this[`solve${this.model.spec.operator}`]();
};

parser.parse(process.argv[2], function(model){
  const checker = new ModelChecker(model);
  console.log('\nSatisfying states:');
  console.log(checker.solve().map(s => s.name));
});