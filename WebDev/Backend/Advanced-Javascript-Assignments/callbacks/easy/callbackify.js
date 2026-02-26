// Problem Description – callbackify(fn)
//
// You are required to write a function named callbackify that takes a function
// which returns a Promise.
// The function should return a new function that accepts a callback as its
// last argument.
// When the Promise resolves, the callback should be called with `(null, data)`.
// When the Promise rejects, the callback should be called with the error.

// calling function as arry and return the element form the end 
function callbackify(fn) {
  return function(...arg){
    // returing the last element 
    const callback = arg.pop();
   fn(...arg).then(data=>{
    callback(null , data)
   }).catch(error=>{
    callback(error)
   })

  
  }
}

module.exports = callbackify;
