const BDD = require('./bdd');
const utils = require('./utils');

const BDDCoder = function(){};

BDDCoder.prototype.fromStates = function(states, opts){
  if (!opts.satisfies) opts.satisfies = function(state, variable) {
    return state.labels.includes(variable);
  }

  function valuate(state, valuation){
    if (opts && opts.filter && !opts.filter(state)) return 0;
    return valuation.reduce(function(result, value, index){
      return result & !(value ^ opts.satisfies(state, opts.variables[index]))
    }, 1);
  }

  const truthTable = [];
  for (let i = 0; i < Math.pow(2, opts.variables.length); i++) {
    const valuation = utils.leftpad(i.toString(2), opts.variables.length, 0).split('').map(Number);
    const value = states.reduce(function(result, state){
      return result | valuate(state, valuation);
    }, 0);
    truthTable.push(valuation.concat(value));
  }
  return new BDD({
    truthTable,
    variables: opts.variables
  }).reduce();
};

BDDCoder.prototype.fromTransitionFn = function(states, opts){
  function getState(valuation){
    return states.find(function(state){
      return valuation.every(function(value, index){
        return !(value ^ opts.satisfies(state, opts.variables[2 * index]))
      });
    });
  }

  function hasTransition(valuation){
    const source = getState(valuation.filter((value, index) => index % 2 === 0));
    const destination = getState(valuation.filter((value, index) => index % 2 === 1));

    if (source === undefined || destination === undefined) return 0;
    return Number(source.transitions.some(tx => tx.name === destination.name));
  }

  const truthTable = [];
  for (let i = 0; i < Math.pow(2, opts.variables.length); i++) {
    const valuation = utils.leftpad(i.toString(2), opts.variables.length, 0).split('').map(Number);
    truthTable.push(valuation.concat(hasTransition(valuation)));
  }

  return new BDD({
    truthTable,
    variables: opts.variables
  }).reduce();
};

BDDCoder.prototype.fromSatisfies = function(states, opts){
  return this.fromStates(states, opts);
};

module.exports = new BDDCoder();