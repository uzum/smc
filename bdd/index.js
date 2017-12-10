const printTree = require('print-tree');
const utils = require('../utils');

global.LOG = function(text){
  // console.log(text);
};

function BDD(opts){
  if (opts.truthTable) {
    this.truthTable = opts.truthTable;
    this.variables = opts.variables
      || opts.truthTable[0].map((r, i) => `X${i + 1}`).slice(0, -1);
    this.varCount = this.variables.length;
    this.root = this.createTree();
  } else if (opts.root) {
    this.root = opts.root;
  }
  this.reduction = {
    latestLabel: 1,
    labelReference: []
  };
}

BDD.apply = function(left, right, operation){
  return new BDD({
    root: BDD._apply(left.root, right.root, operation)
  }).reduce();
};

BDD._apply = function(left, right, operation){
  // if left and right are terminals, return a terminal node 
  // whose index is operation(left, right) -> either B0 or B1
  if (left.terminal && right.terminal) {
    return {
      terminal: true,
      value: operation(left.value, right.value)
    };
  }

  // if left and right are non-terminal nodes with same variable index,
  // then create a new node with the same variable index
  // low of this new node will be apply(op, low(left), low(right))
  // high of this new node will be apply(op, high(left), high(right)) 
  if (!left.terminal && !right.terminal && left.variable === right.variable) {
    return {
      variable: left.variable,
      low: BDD._apply(left.low, right.low, operation),
      high: BDD._apply(left.high, right.high, operation)
    };
  }

  // if none of the cases above are satisfied, then choose the node with
  // higher variable index. Then create a new node with this variable index
  // low of this new node will be apply(op, low(higher), lower)
  // high of this new node will be apply(op, high(higher), lower)
  let higher, lower;
  if (left.terminal || right.terminal) {
    higher = left.terminal ? right : left;
  } else {
    higher = left.variable < right.variable ? left : right;
  }
  lower = left === higher ? right : left;

  return {
    variable: higher.variable,
    low: BDD._apply(higher.low, lower, operation),
    high: BDD._apply(higher.high, lower, operation)
  };
};

BDD.prototype.getPathValue = function(path){
  return {
    terminal: true,
    value: this.truthTable.find(function(row){
      return row.slice(0, -1).every((value, index) => path[index] === value);
    })[this.varCount]
  };
};

BDD.prototype.createTree = function(path = [], index = 0){
  // LOG(`creating tree with path ${path.join('')}`);
  if (this.varCount === 0) {
    return {
      terminal: true,
      value: this.truthTable[0]
    }
  }

  if (index === this.varCount - 1) {
    return {
      variable: this.variables[index],
      high: this.getPathValue(path.concat(1)),
      low: this.getPathValue(path.concat(0))
    };
  }

  return {
    variable: this.variables[index],
    high: this.createTree(path.concat(1), index + 1),
    low: this.createTree(path.concat(0), index + 1)
  };
};

BDD.prototype.forEach = function(fn, node){
  if (node === undefined) node = this.root;

  fn(node);
  if (!node.terminal) {
    this.forEach(fn, node.high);
    this.forEach(fn, node.low);
  }
}

BDD.prototype.find = function(fn, node){
  if (node === undefined) node = this.root;

  if (fn(node)) return node;
  if (node.terminal) return fn(node);
  return this.find(fn, node.high) || this.find(fn, node.low);
};

BDD.prototype.print = function(){
  printTree(this.root, function(node){
    if (node.terminal) return `${node.value} (#${node.label})`;
    return `${node.variable} (#${node.label})`;
  }, function(node){
    if (node.terminal) return [];
    return [node.high, node.low];
  });
};

BDD.prototype.topologicalSort = function(node){
  if (node === undefined) node = this.root;

  if (node.terminal) return [node.label];
  return [node.label]
    .concat(this.topologicalSort(node.high))
    .concat(this.topologicalSort(node.low));
};

BDD.prototype.reorganize = function(){
  this.forEach((node) => {
    this.reduction.labelReference[node.label] = node;
  });

  this.root = this.rebuild(this.root);
  return this;
};

BDD.prototype.rebuild = function(node){
  if (!node.terminal) {
    this.rebuild(node.low);
    this.rebuild(node.high);

    if (node.low.label === node.high.label) return node.low;

    node.low = this.reduction.labelReference[node.low.label];
    node.high = this.reduction.labelReference[node.high.label];
  }
  return node;
};

// for each node with the given variable index
// redirect incoming edges to the
// - low(node) if value is 0
// - high(node) if value is 1
// reduce the resulting bdd
BDD.prototype.restrict = function(value, variable){
  this.root = this._restrict(value, variable, this.root);
  return this.reduce();
};

BDD.prototype._restrict = function(value, variable, node){
  if (node.terminal) return node;
  if (node.variable === variable) {
    if (value) return this._restrict(value, variable, node.high);
    else return this._restrict(value, variable, node.low);
  }
  node.high = this._restrict(value, variable, node.high);
  node.low = this._restrict(value, variable, node.low);
  return node;
};

BDD.prototype.reduce = function(){
  this._reduce(this.root);
  return this.reorganize();
};

BDD.prototype.clone = function(){
  return new BDD({
    root: utils.deepClone(this.root)
  });
};

BDD.prototype._reduce = function(node){
  // all 0 terminal nodes are labeled with 0
  // all 1 terminal nodes are labeled with 1
  if (node.terminal) {
    node.label = node.value;
    return;
  }

  if (!node.high.label) this._reduce(node.high);
  if (!node.low.label) this._reduce(node.low);

  // if id(lo(n)) = id(hi(n))
  // then id(n) = id(lo(n))
  if (node.high.label === node.low.label) {
    node.label = node.low.label;
    if (node.low.terminal) {
      node.terminal = true;
      node.value = node.low.value;
    } else {
      node.variable = node.low.variable;
    }
    return;
  }

  // else if there is another node m such that
  // m has the same variable and
  // id(lo(n)) = id(lo(m)) and
  // id(hi(n)) = id(hi(m))
  // then id(n) = id(m)
  let sibling;
  if (sibling = this.find(function(candidate){
    return !candidate.terminal &&
      candidate.label &&
      candidate.variable === node.variable &&
      candidate.low.label === node.low.label &&
      candidate.high.label === candidate.high.label;
  })){
    node.label = sibling.label;
    node.variable = sibling.variable;
    return;
  }

  // else id = next unused integer
  node.label = ++this.reduction.latestLabel;
};

BDD.prototype.exists = function(variable){
  return BDD.apply(
    this.clone().restrict(0, variable),
    this.clone().restrict(1, variable),
    (l, r) => l | r
  );
};

BDD.prototype.forall = function(variable){
  return BDD.apply(
    this.clone().restrict(0, variable),
    this.clone().restrict(1, variable),
    (l, r) => l & r
  );
};

module.exports = BDD;
