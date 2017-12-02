const BDD = require('..');
const assert = require('assert');

describe('bdd - reduce', function(){
  specify('B0', function(){
    const bdd = new BDD({
      truthTable: [[0]]
    });
    bdd.reduce();
    assert.strictEqual(bdd.topologicalSort().join(''), '0');
  });

  specify('B1', function(){
    const bdd = new BDD({
      truthTable: [[1]]
    });
    bdd.reduce();
    assert.strictEqual(bdd.topologicalSort().join(''), '1');
  });

  specify('Y = X1', function(){
    const bdd = new BDD({
      truthTable: [[0, 0], [1, 1]]
    });
    bdd.reduce();
    assert.strictEqual(bdd.topologicalSort().join(''), '210');
  });

  specify('Y = !X1 & !X2', function(){
    const bdd = new BDD({
      truthTable: [
        [0, 0, 1],
        [0, 1, 0],
        [1, 0, 0],
        [1, 1, 0]
      ]
    });
    bdd.reduce();
    assert.strictEqual(bdd.topologicalSort().join(''), '30201');
  });

  specify('Y = X1 | (X2 & X3)', function(){
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
    bdd.reduce();
    assert.strictEqual(bdd.topologicalSort().join(''), '4132100');
  });

  specify('Y = even(X1, X2, X3, X4)', function(){
    const bdd = new BDD({
      truthTable: [
        [0, 0, 0, 0, 1],
        [0, 0, 0, 1, 0],
        [0, 0, 1, 0, 0],
        [0, 0, 1, 1, 1],
        [0, 1, 0, 0, 0],
        [0, 1, 0, 1, 1],
        [0, 1, 1, 0, 1],
        [0, 1, 1, 1, 0],
        [1, 0, 0, 0, 0],
        [1, 0, 0, 1, 1],
        [1, 0, 1, 0, 1],
        [1, 0, 1, 1, 0],
        [1, 1, 0, 0, 1],
        [1, 1, 0, 1, 0],
        [1, 1, 1, 0, 0],
        [1, 1, 1, 1, 1]
      ]
    });
    bdd.reduce();
    assert.strictEqual(bdd.topologicalSort().join(''), '8642103015301210753012104210301');
  });

  specify('Y = X1 | X3 (X2 invariance)', function(){
    const bdd = new BDD({
      truthTable: [
        [0, 0, 0, 0],
        [0, 0, 1, 0],
        [0, 1, 0, 0],
        [0, 1, 1, 0],
        [1, 0, 0, 0],
        [1, 0, 1, 1],
        [1, 1, 0, 0],
        [1, 1, 1, 1]
      ]
    });
    bdd.reduce();
    assert.strictEqual(bdd.topologicalSort().join(''), '32100'); 
  });

  specify('Y = f(X1, X2, X3, X4) -> (X1 and X3 invariance)', function(){
    const bdd = new BDD({
      truthTable: [
        [0, 0, 0, 0, 0],
        [0, 0, 0, 1, 0],
        [0, 0, 1, 0, 0],
        [0, 0, 1, 1, 0],
        [0, 1, 0, 0, 1],
        [0, 1, 0, 1, 0],
        [0, 1, 1, 0, 1],
        [0, 1, 1, 1, 0],
        [1, 0, 0, 0, 0],
        [1, 0, 0, 1, 0],
        [1, 0, 1, 0, 0],
        [1, 0, 1, 1, 0],
        [1, 1, 0, 0, 1],
        [1, 1, 0, 1, 0],
        [1, 1, 1, 0, 1],
        [1, 1, 1, 1, 0]
      ]
    });
    bdd.reduce();
    assert.strictEqual(bdd.topologicalSort().join(''), '32010'); 
  });

  specify('custom example I', function(){
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
    bdd.reduce();
    assert.strictEqual(bdd.topologicalSort().join(''), '531210431210210');
  });

  specify('custom example II', function(){
    const bdd = new BDD({
      truthTable: [
        [0, 0, 0, 0, 0],
        [0, 0, 0, 1, 1],
        [0, 0, 1, 0, 0],
        [0, 0, 1, 1, 1],
        [0, 1, 0, 0, 0],
        [0, 1, 0, 1, 1],
        [0, 1, 1, 0, 0],
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
    bdd.reduce();
    assert.strictEqual(bdd.topologicalSort().join(''), '431210210');
  });
});
