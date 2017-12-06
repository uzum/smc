const BDDCoder = require('../bdd-coder');
const assert = require('assert');

describe('bdd-coder - from states', function(){
  specify('pq', function(){
    const states = [
      { labels: ['p0', 'q0'] }    
    ];
    const bdd = BDDCoder.fromStates(states, {
      variables: ['p0', 'q0']
    });
    assert.strictEqual(bdd.topologicalSort().join(''), '32100');
  });

  specify("pq + p'q'", function(){
    const states = [
      { labels: ['p0', 'q0'] },
      { labels: ['NN'] }    
    ];
    const bdd = BDDCoder.fromStates(states, {
      variables: ['p0', 'q0']
    });
    assert.strictEqual(bdd.topologicalSort().join(''), '4210301');
  });

  specify("pq' + p'q + p'q'", function(){
    const states = [
      { labels: ['p0'] },
      { labels: ['q0'] },
      { labels: ['NN'] }    
    ];
    const bdd = BDDCoder.fromStates(states, {
      variables: ['p0', 'q0']
    });
    assert.strictEqual(bdd.topologicalSort().join(''), '32011');
  });
});

describe('bdd-coder - from transition function', function(){

});