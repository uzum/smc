const printTree = require('print-tree');

function BDD(truthTable){
  this.truthTable = truthTable;
  this.varCount = truthTable[0].length - 1;
  this.root = this.createTree(1, []);

  this.reduction = {
    latestLabel: 1
  };
}

BDD.prototype.getPathValue = function(path){
  return {
    terminal: true,
    index: this.truthTable.find(function(row){
      return row.slice(0, -1).every((value, index) => path[index] === value);
    })[this.varCount]
  };
};

BDD.prototype.createTree = function(index, path){
  if (index === this.varCount) return {
    index: index,
    high: this.getPathValue(path.concat(1)),
    low: this.getPathValue(path.concat(0))
  };

  return {
    index: index,
    high: this.createTree(index + 1, path.concat(1)),
    low: this.createTree(index + 1, path.concat(0))
  };
};

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

BDD.prototype.reorganize = function(){

};

BDD.prototype.reduce = function(node){
  if (node === undefined) node = this.root;

  // all 0 terminal nodes are labeled with 0
  // all 1 terminal nodes are labeled with 1
  if (node.terminal) {
    node.label = node.index;
    return;
  }

  if (!node.high.label) this.reduce(node.high);
  if (!node.low.label) this.reduce(node.low);

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