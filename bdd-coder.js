const BDD = require('./bddv2');
const utils = require('./utils');

const BDDCoder = function(){};

BDDCoder.prototype.fromStates = function(model, opts = {}){
  if (!opts.filter) opts.filter = () => true;
  if (!opts.satisfies) opts.satisfies = (state, variable) => state.satisfies(variable);
  if (!opts.variables) opts.variables = model.variables;

  return new BDD({
    fn: (_) => {
      return model.states.filter(opts.filter).some((state) => {
        return opts.variables.every((variable) => {
          return !(_[variable] ^ opts.satisfies(state, variable));
        });
      });
    },
    variables: opts.variables
  });
};

BDDCoder.prototype.fromTransition = function(model, opts = {}){
  if (!opts.satisfes) opts.satisfies = (state, variable) => state.satisfies(variable);
  if (!opts.variables) opts.variables = model.variables.reduce((list, variable) => {
    return list.concat(variable, `${variable}'`);
  }, []);

  function getState(valuation){
    return model.states.find(function(state){
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

  return new BDD({
    fn: (_) => hasTransition(opts.variables.map(v => _[v])),
    variables: opts.variables
  });
};

module.exports = new BDDCoder();