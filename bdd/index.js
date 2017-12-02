const printTree = require('print-tree');

function BDD(opts){
  if (opts.truthTable) {
    this.truthTable = opts.truthTable;
    this.varCount = opts.truthTable[0].length - 1;
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
  return new BDD({ root: BDD._apply(left.root, right.root, operation )}).reduce();
};

BDD._apply = function(left, right, operation){
  // if left and right are terminals, return a terminal node 
  // whose index is operation(left, right) -> either B0 or B1
  if (left.terminal && right.terminal) {
    return {
      terminal: true,
      index: operation(left.index, right.index)
    };
  }

  // if left and right are non-terminal nodes with same variable index,
  // then create a new node with the same variable index
  // low of this new node will be apply(op, low(left), low(right))
  // high of this new node will be apply(op, high(left), high(right)) 
  if (!left.terminal && !right.terminal && left.index === right.index) {
    return {
      index: left.index,
      low: BDD._apply(left.low, right.low, operation),
      high: BDD._apply(left.high, right.high, operation)
    };
  }

  // if none of the cases above are satisfied, then choose the node with
  // higher variable index. Then create a new node with this variable index
  // low of this new node will be apply(op, low(higher), lower)
  // high of this new node will be apply(op, high(higher), lower)
  const higher = left.index > right.index ? left : right;
  const lower = left === higher ? right : left;

  return {
    index: higher.index,
    low: BDD._apply(higher.low, lower, operation),
    high: BDD._apply(higher.high, lower, operation)
  };
};

BDD.prototype.getPathValue = function(path){
  return {
    terminal: true,
    index: this.truthTable.find(function(row){
      return row.slice(0, -1).every((value, index) => path[index] === value);
    })[this.varCount]
  };
};

BDD.prototype.createTree = function(path = [], index = 1){
  if (this.varCount === 0) {
    return {
      terminal: true,
      index: this.truthTable[0]
    }
  }

  if (index === this.varCount) {
    return {
      index: index + 1,
      high: this.getPathValue(path.concat(1)),
      low: this.getPathValue(path.concat(0))
    };
  }

  return {
    index: index + 1,
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
    if (node.terminal) return `${node.index} (#${node.label})`;
    return `X${node.index} (#${node.label})`;
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
    if (!node.terminal && node.low.label === node.high.label) return;
    this.reduction.labelReference[node.label] = node;
  });

  this.root = this.rebuild(this.root);
  return this;
};

BDD.prototype.rebuild = function(node){
  if (!node.terminal) {
    node.low = this.reduction.labelReference[node.low.label];
    node.high = this.reduction.labelReference[node.high.label];

    if (node.low.label === node.high.label) {
      return this.rebuild(node.low);
    }
    this.rebuild(node.low);
    this.rebuild(node.high);
  }
  return node;
};

BDD.prototype.reduce = function(){
  this._reduce(this.root);
  return this.reorganize();
};

BDD.prototype._reduce = function(node){
  // all 0 terminal nodes are labeled with 0
  // all 1 terminal nodes are labeled with 1
  if (node.terminal) {
    node.label = node.index;
    return;
  }

  if (!node.high.label) this._reduce(node.high);
  if (!node.low.label) this._reduce(node.low);

  // if id(lo(n)) = id(hi(n))
  // then id(n) = id(lo(n))
  if (node.high.label === node.low.label) {
    node.label = node.low.label;
    node.index = node.low.index;
    if (node.low.terminal) node.terminal = true;
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
      candidate.index === node.index &&
      candidate.low.label === node.low.label &&
      candidate.high.label === candidate.high.label;
  })){
    node.label = sibling.label;
    node.index = sibling.index;
    if (sibling.terminal) node.terminal = true;
    return;
  }

  // else id = next unused integer
  node.label = ++this.reduction.latestLabel;
};

module.exports = BDD;
