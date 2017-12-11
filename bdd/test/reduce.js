const BDD = require('..');
const assert = require('assert');
const utils = require('../../utils');

const generateTable = function(n){
  const truthTable = [];
  for (let i = 0; i < Math.pow(2, n); i++) {
    const valuation = utils.leftpad(i.toString(2), n, 0).split('').map(Number);
    truthTable.push(valuation.concat(Math.random() < 0.5));
  }
  return truthTable;
};

describe('bdd - reduce', function(){
  this.timeout(60000);
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

  specify(Math.pow(2, 7) + ' states', function(){
    const bdd = new BDD({
      truthTable: generateTable(7)
    });
    bdd.reduce();
  });

  specify(Math.pow(2, 10) + ' states', function(){
    const bdd = new BDD({
      truthTable: generateTable(10)
    });
    bdd.reduce();
  });

  specify(Math.pow(2, 11) + ' states', function(){
    const bdd = new BDD({
      truthTable: generateTable(11)
    });
    bdd.reduce();
  });

  specify(Math.pow(2, 12) + ' states', function(){
    const bdd = new BDD({
      truthTable: generateTable(12)
    });
    bdd.reduce();
  });

  specify(Math.pow(2, 13) + ' states', function(){
    const bdd = new BDD({
      truthTable: generateTable(13)
    });
    bdd.reduce();
  });

  specify(Math.pow(2, 14) + ' states', function(){
    const bdd = new BDD({
      truthTable: generateTable(14)
    });
    bdd.reduce();
  });

  specify(Math.pow(2, 15) + ' states', function(){
    const bdd = new BDD({
      truthTable: generateTable(15)
    });
    bdd.reduce();
  });
});
