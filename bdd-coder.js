const BDD = require('./bddv2');
const utils = require('./utils');

const BDDCoder = function(){};

BDDCoder.prototype.adviceOrder = function(model){
  let max = { value: 0 };
  function correlation(var1, var2){
    let count = model.states.filter(s => s.satisfies(var1) && s.satisfies(var2)).length;
    model.states.forEach(function(model){
      if (model.satisfies(var1)) {
        count += model.transitions.filter(t => t.satisfies(var2)).length;
      }
    });
    return count;
  }

  const matrix = [];
  for (let i = 0; i < model.variables.length; i++) {
    matrix[i] = [];
    for (let j = 0; j < model.variables.length; j++) {
      if (i === j) matrix[i][j] = 0;
      else {
        const corr = correlation(model.variables[i], model.variables[j]);
        if (corr > max.value) {
          max = {i, j, value: corr };
        }
        matrix[i][j] = corr;
      }
    }
  }

  const marked = [];
  const variables = [];
  while (variables.length < model.variables.length) {
    variables.push(model.variables[max.i]);
    variables.push(model.variables[max.j]);
    marked[max.i] = true;
    marked[max.j] = true;
    max.value = 0;
    for (i = 0; i < model.variables.length; i++) {
      if (marked[i]) continue;
      for (j = 0; j < model.variables.length; j++) {
        if (marked[j]) continue;
        if (matrix[i][j] > max.value) max = {i, j, value: matrix[i][j] }
      }
    }
    if (max.value === 0) break;
  }

  model.variables.forEach((v) => {
    if (variables.indexOf(v) === -1) variables.push(v)
  });
  return variables;
}

BDDCoder.prototype.fromStates = function(model, opts = {}){
  if (!opts.filter) opts.filter = () => true;
  if (!opts.satisfies) opts.satisfies = (state, variable) => state.satisfies(variable);
  if (!opts.variables) opts.variables = this.adviceOrder(model);

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
  if (!opts.variables) opts.variables = this.adviceOrder(model).reduce((list, variable) => {
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