const BDD = require('..');
const assert = require('assert');

describe('bdd - exists/forall', function(){
  specify('Y = X, exists(X)', function(){
    const bdd = new BDD({ truthTable: [[0, 0], [1, 1]] });
    const exists = bdd.exists('X1');

    assert.strictEqual(exists.topologicalSort().join(''), '1');
  });

  specify('Y = X, forall(X)', function(){
    const bdd = new BDD({ truthTable: [[0, 0], [1, 1]] });
    const forall = bdd.forall('X1');

    assert.strictEqual(forall.topologicalSort().join(''), '0');
  });

  specify('Y = X1 | (X2 & X3), exists(X2)', function(){
    const bdd = new BDD({
      truthTable: [
        [0, 0, 0, 0],
        [0, 0, 1, 0],
        [0, 1, 0, 0],
        [0, 1, 1, 1],
        [1, 0, 0, 1],
        [1, 0, 1, 1],
        [1, 1, 0, 1],
        [1, 1, 1, 1]
      ]
    });
    const exists = bdd.exists('X2');

    assert.strictEqual(exists.topologicalSort().join(''), '31210');
  });

  specify('Y = X1 | (X2 & X3), forall(X2)', function(){
    const bdd = new BDD({
      truthTable: [
        [0, 0, 0, 0],
        [0, 0, 1, 0],
        [0, 1, 0, 0],
        [0, 1, 1, 1],
        [1, 0, 0, 1],
        [1, 0, 1, 1],
        [1, 1, 0, 1],
        [1, 1, 1, 1]
      ]
    });
    const forall = bdd.forall('X2');

    assert.strictEqual(forall.topologicalSort().join(''), '210');
  });
});