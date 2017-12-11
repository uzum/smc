const BDD = require('..');
const assert = require('assert');

describe('BDD - create', function(){
  this.timeout(60000);
  specify('f1', function(){
    const time = Date.now();
    const b0 = new BDD({
      fn: (_) => {
        return (_.b | _.d) & (_.c | _.e) & (_.a | _.d | _.e) & 
               (_.g | _.i) & (_.h | _.j) & (_.f | _.i | _.j) & 
               (_.l | _.n) & (_.m | _.o) & (_.k | _.n | _.o) & (_.x | _.y);
      },
      variables: ['a', 'b', 'c', 'd', 'e',
                  'f', 'g', 'h', 'i', 'j',
                  'k', 'l', 'm', 'n', 'o', 'x', 'y']
    });
    // b0.printTree();
    console.log('\tNodes: ' + b0.nodes.length);
    console.log('\tTime: ' + (Date.now() - time));
  });

  specify('f1-ordered', function(){
    const time = Date.now();
    const b0 = new BDD({
      fn: (_) => {
        return (_.b | _.d) & (_.c | _.e) & (_.a | _.d | _.e) & 
               (_.g | _.i) & (_.h | _.j) & (_.f | _.i | _.j) & 
               (_.l | _.n) & (_.m | _.o) & (_.k | _.n | _.o) & (_.x | _.y);
      },
      variables: ['b', 'd', 'a', 'e', 'c',
                  'g', 'i', 'f', 'j', 'h',
                  'l', 'n', 'k', 'o', 'm', 'x', 'y']
    });
    // b0.printTree();
    console.log('\tNodes: ' + b0.nodes.length);
    console.log('\tTime: ' + (Date.now() - time));
  });

  specify('f2', function(){
    const time = Date.now();
    const b0 = new BDD({
      fn: (_) => {
        return (_.a | _.b) & (_.c | _.d) & (_.e | _.f) & (_.g | _.h) &
               (_.i | _.j) & (_.k | _.l) & (_.m | _.n) & (_.o | _.p);
      },
      variables: ['a', 'p', 'i', 'k', 'o',
                  'f', 'm', 'h', 'c', 'j',
                  'd', 'g', 'l', 'n', 'e', 'b']
    });
    // b0.printTree();
    console.log('\tNodes: ' + b0.nodes.length);
    console.log('\tTime: ' + (Date.now() - time));
  });

  specify('f2-ordered', function(){
    const time = Date.now();
    const b0 = new BDD({
      fn: (_) => {
        return (_.a | _.b) & (_.c | _.d) & (_.e | _.f) & (_.g | _.h) &
               (_.i | _.j) & (_.k | _.l) & (_.m | _.n) & (_.o | _.p);
      },
      variables: ['a', 'b', 'c', 'd', 'e',
                  'f', 'g', 'h', 'i', 'j',
                  'k', 'l', 'm', 'n', 'o', 'p']
    });
    // b0.printTree();
    console.log('\tNodes: ' + b0.nodes.length);
    console.log('\tTime: ' + (Date.now() - time));
  });
});