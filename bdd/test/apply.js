const BDD = require('..');
const assert = require('assert');

describe('bdd - apply', function(){
  specify('B0 | B1', function(){
    const left = new BDD({ truthTable: [[ 0 ]] });
    const right = new BDD({ truthTable: [[ 1 ]] });
    const applied = BDD.apply(left, right, (l, r) => l | r);

    assert.strictEqual(applied.topologicalSort().join(''), '1');
  });

  specify('B0 & B1', function(){
    const left = new BDD({ truthTable: [[ 0 ]] });
    const right = new BDD({ truthTable: [[ 1 ]] });
    const applied = BDD.apply(left, right, (l, r) => l & r);

    assert.strictEqual(applied.topologicalSort().join(''), '0');
  });

  specify('Y = X XOR Y = X', function(){
    const left = new BDD({ truthTable: [[0, 0], [1, 1]] });
    const right = new BDD({ truthTable: [[0, 0], [1, 1]] });
    const applied = BDD.apply(left, right, (l, r) => l ^ r);

    assert.strictEqual(applied.topologicalSort().join(''), '0');
  });

  specify('Y = X XOR Y = !X', function(){
    const left = new BDD({ truthTable: [[0, 0], [1, 1]] });
    const right = new BDD({ truthTable: [[0, 1], [1, 0]] });
    const applied = BDD.apply(left, right, (l, r) => l ^ r);

    assert.strictEqual(applied.topologicalSort().join(''), '1');
  });

  specify('Y = X & Y = X', function(){
    const left = new BDD({ truthTable: [[0, 0], [1, 1]] });
    const right = new BDD({ truthTable: [[0, 0], [1, 1]] });
    const applied = BDD.apply(left, right, (l, r) => l & r);

    assert.strictEqual(applied.topologicalSort().join(''), '210');
  });

  specify('custom I | custom II', function(){
    const left = new BDD({ truthTable: [
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

    const right = new BDD({ truthTable: [
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

    const applied = BDD.apply(left, right, (l, r) => l | r);

    assert.strictEqual(applied.topologicalSort().join(''), '531210431210210');
  });

  specify('custom III & custom IV', function(){
    const left = new BDD({ truthTable: [
        [0, 0, 0, 0, 0],
        [0, 0, 0, 1, 1],
        [0, 0, 1, 0, 0],
        [0, 0, 1, 1, 1],
        [0, 1, 0, 0, 1],
        [0, 1, 0, 1, 0],
        [0, 1, 1, 0, 1],
        [0, 1, 1, 1, 0],
        [1, 0, 0, 0, 1],
        [1, 0, 0, 1, 0],
        [1, 0, 1, 0, 1],
        [1, 0, 1, 1, 0],
        [1, 1, 0, 0, 0],
        [1, 1, 0, 1, 1],
        [1, 1, 1, 0, 0],
        [1, 1, 1, 1, 1]
      ]
    });

    const right = new BDD({ truthTable: [
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

    const applied = BDD.apply(left, right, (l, r) => l & r);
    assert.strictEqual(applied.topologicalSort().join(''), '4032010');
  });

  specify('custom V & custom VI', function(){
    const left = new BDD({ truthTable: [
        [0, 0, 0],
        [0, 1, 0],
        [1, 0, 1],
        [1, 1, 0],
      ]
    });

    const right = new BDD({ truthTable: [
        [0, 0, 0],
        [0, 1, 1],
        [1, 0, 0],
        [1, 1, 0],
      ]
    });

    const applied = BDD.apply(left, right, (l, r) => l | r);
    assert.strictEqual(applied.topologicalSort().join(''), '4201310');
  });
});