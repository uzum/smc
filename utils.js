exports.leftpad = function(str, length, value){
  const missing = length - str.length;
  for (let i = 0; i < missing; i++) {
    str = value + str;
  }
  return str;
};

exports.deepClone = function(source){
  return JSON.parse(JSON.stringify(source));
  // const target = Array.isArray(source) ? [] : {};
  // for (let prop in source) {
  //   const field = source[prop];
  //   if (typeof field === 'object') target[prop] = exports.deepClone(field);
  //   else target[prop] = field;
  // }
  // return target;
}