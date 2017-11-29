const BDD = require('./bdd');

const truthTable = [
  // B0
  // [0]

  // B1
  // [1]

  // X1
  // [0, 0],
  // [1, 1]

  // !X1 & !X2
  // [0, 0, 1],
  // [0, 1, 0],
  // [1, 0, 0],
  // [1, 1, 0]

  // X1 | (X2 & X3)
  // [0, 0, 0, 0],
  // [0, 0, 1, 0],
  // [0, 1, 0, 0],
  // [0, 1, 1, 1],
  // [1, 0, 0, 1],
  // [1, 0, 1, 1],
  // [1, 1, 0, 1],
  // [1, 1, 1, 1]

  // even(X1, X2, X3, X4)
  // [0, 0, 0, 0, 1],
  // [0, 0, 0, 1, 0],
  // [0, 0, 1, 0, 0],
  // [0, 0, 1, 1, 1],
  // [0, 1, 0, 0, 0],
  // [0, 1, 0, 1, 1],
  // [0, 1, 1, 0, 1],
  // [0, 1, 1, 1, 0],
  // [1, 0, 0, 0, 0],
  // [1, 0, 0, 1, 1],
  // [1, 0, 1, 0, 1],
  // [1, 0, 1, 1, 0],
  // [1, 1, 0, 0, 1],
  // [1, 1, 0, 1, 0],
  // [1, 1, 1, 0, 0],
  // [1, 1, 1, 1, 1],

  // X1 | X3 (X2 invariant)
  [0, 0, 0, 0],
  [0, 0, 1, 0],
  [0, 1, 0, 0],
  [0, 1, 1, 0],
  [1, 0, 0, 0],
  [1, 0, 1, 1],
  [1, 1, 0, 0],
  [1, 1, 1, 1]
];

const bdd = new BDD({ truthTable });
console.log('original');
bdd.print();
bdd.reduce();

console.log('reduced');
bdd.print();
