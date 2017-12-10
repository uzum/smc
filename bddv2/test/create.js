const BDD = require('..');
const assert = require('assert');

function vars(n){
  return Array.from({ length: n }, (_, i) => `x${i + 1}`);
}

describe('BDD - create', function(){
  this.timeout(60000);
  specify('B0', function(){
    const b0 = new BDD({
      fn: () => false,
      variables: vars(1)
    });
    assert(b0.isFalse());
  });

  specify('B0', function(){
    const b1 = new BDD({
      fn: () => true,
      variables: vars(1)
    });
    assert(b1.isTrue());
  });

  specify('Y = X1', function(){
    const bdd = new BDD({
      fn: (_) => _.x1,
      variables: vars(1)
    });
    assert.strictEqual(bdd.topologicalSort().join(''), '210');
  });

  specify('Y = !X1 & !X2', function(){
    const bdd = new BDD({
      fn: (_) => !_.x1 & !_.x2,
      variables: vars(2)
    });
    assert.strictEqual(bdd.topologicalSort().join(''), '30201');
  });

  specify('Y = X1 | (X2 & X3)', function(){
    const bdd = new BDD({
      fn: (_) => _.x1 | ( _.x2 & _.x3 ),
      variables: vars(3)
    });
    assert.strictEqual(bdd.topologicalSort().join(''), '4132100');
  });

  specify('Y = even(X1, X2, X3, X4)', function(){
    const bdd = new BDD({
      fn: (_) => [_.x1, _.x2, _.x3, _.x4].filter(i => i).length % 2 === 0,
      variables: vars(4)
    });
    assert.strictEqual(bdd.topologicalSort().join(''), '8743102015201310652013104310201');
  });

  specify('Y = X1 | X3 (X2 invariance)', function(){
    const bdd = new BDD({
      fn: (_) => _.x1 | _.x3,
      variables: vars(3)
    });
    assert.strictEqual(bdd.topologicalSort().join(''), '31210'); 
  });

  specify(`Y = X1 | X2 (${Math.pow(2, 10)} states)`, function(){
    const bdd = new BDD({
      fn: (_) => _.x1 | _.x2,
      variables: vars(10)
    });
  });

  specify(`Y = X1 | X2 (${Math.pow(2, 15)} states)`, function(){
    const bdd = new BDD({
      fn: (_) => _.x1 | _.x2,
      variables: vars(15)
    });
  });

  specify(`Y = X1 | X2 (${Math.pow(2, 16)} states)`, function(){
    const bdd = new BDD({
      fn: (_) => _.x1 | _.x2,
      variables: vars(16)
    });
  });

  specify(`Y = X1 | X2 (${Math.pow(2, 17)} states)`, function(){
    const bdd = new BDD({
      fn: (_) => _.x1 | _.x2,
      variables: vars(17)
    });
  });

  specify(`Y = X1 | X2 (${Math.pow(2, 18)} states)`, function(){
    const bdd = new BDD({
      fn: (_) => _.x1 | _.x2,
      variables: vars(18)
    });
  });

  specify(`Y = X1 | X2 (${Math.pow(2, 19)} states)`, function(){
    const bdd = new BDD({
      fn: (_) => _.x1 | _.x2,
      variables: vars(19)
    });
  });

  specify(`Y = X1 | X2 (${Math.pow(2, 20)} states)`, function(){
    const bdd = new BDD({
      fn: (_) => _.x1 | _.x2,
      variables: vars(20)
    });
  });

  specify(`Y = X1 | X2 (${Math.pow(2, 21)} states)`, function(){
    const bdd = new BDD({
      fn: (_) => _.x1 | _.x2,
      variables: vars(21)
    });
  });

  specify(`Y = X1 | X2 (${Math.pow(2, 22)} states)`, function(){
    const bdd = new BDD({
      fn: (_) => _.x1 | _.x2,
      variables: vars(22)
    });
  });
});