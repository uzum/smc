// author: anil.uzumcuoglu

const printTree = require('print-tree');

const Node = function(index, low, high, id, variable){
  this.id = id;
  this.index = index;
  this.low = low;
  this.high = high;
  this.variable = variable;
};

const BDD = function(opts){
  this.refcount = 2;
  this.hash = Object.create(null);
  this.variables = [null, ...opts.variables];

  this.nodes = [];
  this.fn = opts.fn;
  if (!opts.skipBuild) this.build(this.fn, 1);
  this.root = null;
};

BDD.prototype.clone = function(){
  return new BDD({
    fn: this.fn,
    variables: this.variables.slice(1)
  });
};

BDD.prototype.prime = function(){
  return new BDD({
    fn: (_) => {
      const _prime = {};
      this.variables.slice(1).forEach(v => {
        _prime[v] = _[`${v}'`];
      });
      return this.fn(_prime);
    },
    variables: this.variables.slice(1).map(v => `${v}'`)
  });
};

BDD.prototype.equals = function(other){
  return this.compareNodes(this.getRoot(), other.getRoot());
};

BDD.prototype.compareNodes = function(left, right){
  if (!left.low && !right.low) return left.id === right.id;
  if (!left.low || !right.low) return false;

  return left.id === right.id &&
    this.compareNodes(left.low, right.low) &&
    this.compareNodes(left.high, right.high);
};

BDD.prototype.isTrue = function(){
  return this.getRoot() === this.terminalTrue;
};

BDD.prototype.isFalse = function(){
  return this.getRoot() === this.terminalFalse;
};

BDD.prototype.getRoot = function(){
  if (this.root) return this.root;
  return this.nodes.find((node) => {
    return this.nodes.every(other => {
      return (!other.low || node.id !== other.low.id) &&
        (!other.high || node.id !== other.high.id);
    });
  });
};

BDD.prototype.getVariableIdx = function(variable){
  if (variable === 'T') return this.variables.length;
  return this.variables.indexOf(variable);
};

BDD.prototype.printTable = function(){
  this.nodes.forEach((node) => {
    console.log(`${node.id}\t${node.index} (${node.variable})\
      \t${node.low && node.low.id}\t${node.high && node.high.id}`);
  });
};

BDD.prototype.printTree = function(){
  printTree(this.getRoot(), (node) => {
    if (node.low) return `${node.variable}`;
    return `${node.id}`;
  }, function(node){
    if (node.low) return [node.high, node.low];
    return [];
  });
};

BDD.prototype.restrictF = function(fn, value, index){
  const target = this.variables[index];
  return function(args){
    return fn.apply(this, [Object.assign(args, { [target]: value })]);
  };
}

BDD.prototype.getTerminalNode = function(value){
  if (value) {
    if (!this.terminalTrue) {
      this.terminalTrue = new Node(this.variables.length, null, null, 1, 'T');
      this.nodes.push(this.terminalTrue);
    }
    return this.terminalTrue;
  } else {
    if (!this.terminalFalse) {
      this.terminalFalse = new Node(this.variables.length, null, null, 0, 'T');
      this.nodes.push(this.terminalFalse);
    }
    return this.terminalFalse;
  }
};

BDD.prototype.build = function(fn, variableIdx){
  if (variableIdx > this.variables.length) {
    return this.getTerminalNode(fn({}));
  } else {
    const bdd0 = this.build(this.restrictF(fn, 0, variableIdx), variableIdx + 1);
    const bdd1 = this.build(this.restrictF(fn, 1, variableIdx), variableIdx + 1);
    return this.insert(variableIdx, bdd0, bdd1);
  }
};

BDD.prototype.getNode = function(index, low, high){
  return this.hash[index] &&
    this.hash[index][low.id] &&
    this.hash[index][low.id][high.id];
};

BDD.prototype.setNode = function(index, low, high, node){
  if (!this.hash[index]) this.hash[index] = {};
  if (!this.hash[index][low.id]) this.hash[index][low.id] = {};
  this.hash[index][low.id][high.id] = node;
};

BDD.prototype.insert = function(index, low, high){
  if (low.id === high.id) return low;
  if (this.getNode(index, low, high)) return this.getNode(index, low, high);
  else {
    const node = new Node(index, low, high, this.refcount++, this.variables[index]);
    this.nodes.push(node);
    this.setNode(index, low, high, node);
    return node;
  }
};

BDD.apply = function(left, right, fn, variables){
  if (!variables) variables = left.variables;

  const bdd = new BDD({
    variables,
    fn: function(_){
      return fn(left.fn(_), right.fn(_));
    },
    skipBuild: true
  });
  bdd.apply(left.getRoot(), right.getRoot(), fn);
  return bdd;
};

BDD.prototype.apply = function(left, right, fn){
  if (!left.low && !right.low) {
    return this.getTerminalNode(fn(left.id, right.id))
  } else if (left.variable === right.variable) {
    return this.insert(
      this.getVariableIdx(left.variable),
      this.apply(left.low, right.low, fn),
      this.apply(left.high, right.high, fn)
    );
  } else if (this.getVariableIdx(left.variable) < this.getVariableIdx(right.variable)) {
    return this.insert(
      this.getVariableIdx(left.variable),
      this.apply(left.low, right, fn),
      this.apply(left.high, right, fn)
    );
  } else {
    return this.insert(
      this.getVariableIdx(right.variable),
      this.apply(left, right.low, fn),
      this.apply(left, right.high, fn)
    );
  }
};

BDD.prototype.restrict = function(value, variable){
  return new BDD({
    fn: this.restrictF(this.fn, value, this.variables.indexOf(variable)),
    variables: this.variables.slice(1)
  });
};

BDD.prototype.exists = function(variable){
  return BDD.apply(
    this.restrict(0, variable),
    this.restrict(1, variable),
    (l, r) => l | r
  );
};

BDD.prototype.forall = function(variable){
  return BDD.apply(
    this.restrict(0, variable),
    this.restrict(1, variable),
    (l, r) => l & r
  );
};

BDD.prototype.topologicalSort = function(node){
  if (node === undefined) node = this.getRoot();

  if (!node.low) return [node.id];
  return [node.id]
    .concat(this.topologicalSort(node.high))
    .concat(this.topologicalSort(node.low));
};

module.exports = BDD;