const BDD = require('..');
const assert = require('assert');

describe('bdd - restrict', function(){
	 specify('B0', function(){
    const bdd = new BDD({
      truthTable: [[0]]
    });
    bdd.reduce().restrict(1, 2);
    assert.strictEqual(bdd.topologicalSort().join(''), '0');
  });

  specify('Y = X, R(1, X)', function(){
    const bdd = new BDD({
      truthTable: [
        [0, 0],
        [1, 1]
      ]
    });
    bdd.reduce();
    assert.strictEqual(bdd.topologicalSort().join(''), '210');
    bdd.restrict(1, 2);
    assert.strictEqual(bdd.topologicalSort().join(''), '1');
  });

  specify('Y = X, R(0, X)', function(){
    const bdd = new BDD({
      truthTable: [
        [0, 0],
        [1, 1]
      ]
    });
    bdd.reduce();
    assert.strictEqual(bdd.topologicalSort().join(''), '210');
    bdd.restrict(0, 2);
    assert.strictEqual(bdd.topologicalSort().join(''), '0');
  });

  specify('custom, R(0, X2)', function(){
    const bdd = new BDD({
      truthTable: [
        [0, 0, 0, 0, 0],
        [0, 0, 0, 1, 1],
        [0, 0, 1, 0, 0],
        [0, 0, 1, 1, 1],
        [0, 1, 0, 0, 0],
        [0, 1, 0, 1, 1],
        [0, 1, 1, 0, 1],
        [0, 1, 1, 1, 1],
        [1, 0, 0, 0, 0],
        [1, 0, 0, 1, 1],
        [1, 0, 1, 0, 1],
        [1, 0, 1, 1, 1],
        [1, 1, 0, 0, 0],
        [1, 1, 0, 1, 1],
        [1, 1, 1, 0, 1],
        [1, 1, 1, 1, 1]
      ]
    });
    bdd.reduce().restrict(0, 3);
    assert.strictEqual(bdd.topologicalSort().join(''), '531210210');
  });
});