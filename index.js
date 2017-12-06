// author: anil.uzumcuoglu

const DEBUG = true;

const parser = require('ctl-model-checker/parser');
const BDDCoder = require('./bdd-coder');
const BDD = require('./bdd');
const utils = require('./utils');

const OR = (l, r) => l | r;
const AND = (l, r) => l & r;

global.LOG = function(text){
  DEBUG && console.log(text);
};

const ModelChecker = function(model){
  this.model = model;
  this.model.variables = this.model.states.reduce(function(set, state){
    state.labels.forEach(label => {
      if (label !== 'NN' && !set.includes(label)) set.push(label);
    });
    return set;
  }, []);
};

ModelChecker.prototype.solveEU = function(){
  const variables = this.model.variables;

  // Y = SAT(q)
  let Y = BDDCoder.fromSatisfies(this.model.states, {
    filter: (state) => state.satisfies(this.model.spec.q),
    variables
  });
  LOG(`Y = SAT(${this.model.spec.q}) created`);
  DEBUG && Y.print();

  // Y' = SAT(q)
  const YPrime = BDDCoder.fromSatisfies(this.model.states, {
    filter: (state) => state.satisfies(this.model.spec.q),
    satisfies: (state, variable) => state.satisfies(variable.slice(0, -1)),
    variables: variables.map(v => `${v}'`)
  });
  LOG(`Y\' = SAT(${this.model.spec.q}) created`);
  DEBUG && YPrime.print();

  // W = SAT(p)
  const W = BDDCoder.fromSatisfies(this.model.states, {
    filter: (state) => state.satisfies(this.model.spec.p),
    variables
  });
  LOG(`W = SAT(${this.model.spec.p}) created`);
  DEBUG && W.print();

  // X = Set of states
  let X = BDDCoder.fromStates(this.model.states, {
    variables: variables
  });
  LOG('X = Set of states created');
  DEBUG && X.print();

  // T = transition function
  const T = BDDCoder.fromTransitionFn(this.model.states, {
    satisfies: function(state, variable){
      return state.satisfies(variable) || state.satisfies(variable.slice(0, -1));
    },
    variables: variables.reduce(function(collection, variable){
      return collection.concat(variable).concat(`${variable}'`)
    }, [])
  });
  LOG('T = transition function created');
  DEBUG && T.print();

  while (X.topologicalSort().join('') !== Y.topologicalSort().join('')) {
    X = Y.clone();
    Y = BDD.apply(
      Y,
      BDD.apply(
        W,
        variables.reduce(
          (bdd, variable) => bdd.exists(`${variable}'`),
          BDD.apply(T, YPrime, AND)
        ),
        AND
      ),
      OR
    );
  }

  LOG('Solution BDD is computed');
  DEBUG && Y.print();
  return this.extractStates(Y);
};

ModelChecker.prototype.solveEX = function(){
  const variables = this.model.variables;

  // X' = SAT(p)
  const XPrime = BDDCoder.fromSatisfies(this.model.states, {
    filter: (state) => state.satisfies(this.model.spec.p),
    satisfies: (state, variable) => state.satisfies(variable.slice(0, -1)),
    variables: variables.map(v => `${v}'`)
  });
  LOG(`X\' = SAT(${this.model.spec.p}) created`);
  DEBUG && XPrime.print();
  XPrime.print();

  // T = transition function
  const T = BDDCoder.fromTransitionFn(this.model.states, {
    satisfies: function(state, variable){
      return state.satisfies(variable) || state.satisfies(variable.slice(0, -1));
    },
    variables: variables.reduce(function(collection, variable){
      return collection.concat(variable).concat(`${variable}'`)
    }, [])
  });
  LOG('T = transition function created');
  DEBUG && T.print();

  const solution = variables.reduce(
    (bdd, variable) => bdd.exists(`${variable}'`),
    BDD.apply(T, XPrime, AND)
  );

  LOG('Solution BDD is computed');
  DEBUG && solution.print();
  return this.extractStates(solution);
};

ModelChecker.prototype.solveEF = function(){
  console.log('solving for EF');
};

ModelChecker.prototype.solveEG = function(){
  const variables = this.model.variables;

  // X = 0
  let X = new BDD({ truthTable: [[0]] });
  DEBUG && X.print();

  // Y = SAT(p)
  let Y = BDDCoder.fromSatisfies(this.model.states, {
    filter: (state) => state.satisfies(this.model.spec.p),
    variables
  });
  LOG(`Y = SAT(${this.model.spec.p}) created`);
  DEBUG && Y.print();

  // Y' = SAT(p)
  const YPrime = BDDCoder.fromSatisfies(this.model.states, {
    filter: (state) => state.satisfies(this.model.spec.p),
    satisfies: (state, variable) => state.satisfies(variable.slice(0, -1)),
    variables: variables.map(v => `${v}'`)
  });
  LOG(`Y\' = SAT(${this.model.spec.p}) created`);
  DEBUG && YPrime.print();

  // T = transition function
  const T = BDDCoder.fromTransitionFn(this.model.states, {
    satisfies: function(state, variable){
      return state.satisfies(variable) || state.satisfies(variable.slice(0, -1));
    },
    variables: variables.reduce(function(collection, variable){
      return collection.concat(variable).concat(`${variable}'`)
    }, [])
  });
  LOG('T = transition function created');
  DEBUG && T.print();

  while (X.topologicalSort().join('') !== Y.topologicalSort().join('')) {
    X = Y.clone();
    Y = BDD.apply(
      Y,
      variables.reduce(
        (bdd, variable) => bdd.exists(`${variable}'`),
        BDD.apply(T, YPrime, AND)
      ),
      AND
    );
  }

  LOG('Solution BDD is computed');
  DEBUG && Y.print();
  return this.extractStates(Y);
};

ModelChecker.prototype.solveAU = function(){
  console.log('solving for AU');
};

ModelChecker.prototype.solveAX = function(){
  console.log('solving for AX');
};

ModelChecker.prototype.solveAF = function(){
  const variables = this.model.variables;

  // X = Set of states
  let X = BDDCoder.fromStates(this.model.states, {
    variables: variables
  });
  LOG('X = Set of states created');
  DEBUG && X.print();

  // Y = SAT(p)
  let Y = BDDCoder.fromSatisfies(this.model.states, {
    filter: (state) => state.satisfies(this.model.spec.p),
    variables
  });
  LOG(`Y = SAT(${this.model.spec.p}) created`);
  DEBUG && Y.print();

  // Y' = SAT(p)
  const YPrime = BDDCoder.fromSatisfies(this.model.states, {
    filter: (state) => state.satisfies(this.model.spec.p),
    satisfies: (state, variable) => state.satisfies(variable.slice(0, -1)),
    variables: variables.map(v => `${v}'`)
  });
  LOG(`Y\' = SAT(${this.model.spec.p}) created`);
  DEBUG && YPrime.print();

  // T = transition function
  const T = BDDCoder.fromTransitionFn(this.model.states, {
    satisfies: function(state, variable){
      return state.satisfies(variable) || state.satisfies(variable.slice(0, -1));
    },
    variables: variables.reduce(function(collection, variable){
      return collection.concat(variable).concat(`${variable}'`)
    }, [])
  });
  LOG('T = transition function created');
  DEBUG && T.print();

  while (X.topologicalSort().join('') !== Y.topologicalSort().join('')) {
    X = Y.clone();
    Y = BDD.apply(
      Y,
      variables.reduce(
        (bdd, variable) => bdd.forall(`${variable}'`),
        BDD.apply(T, YPrime, AND)
      ),
      OR
    );
  }

  LOG('Solution BDD is computed');
  DEBUG && Y.print();
  return this.extractStates(Y);
};

ModelChecker.prototype.solveAG = function(){
  console.log('solving for AG');
};

ModelChecker.prototype.extractStates = function(solution){
  const satisfyingPaths = [];
  function dfs(node, path){
    if (node.terminal) {
      if (node.value) satisfyingPaths.push(path);
    } else {
      dfs(node.high, path.concat(node.variable));
      dfs(node.low, path.concat(`!${node.variable}`));
    }
  }
  dfs(solution.root, []);
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

