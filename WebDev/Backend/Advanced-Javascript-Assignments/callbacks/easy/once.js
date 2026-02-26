// Problem Description – once(fn)
//
// You are required to implement a wrapper function named once that accepts a
// callback-based asynchronous function `fn`.
// The wrapper should ensure that `fn` is executed only on the first call.
// Any subsequent calls should not re-execute `fn` and should instead invoke
// the callback with the same result (or error) from the first invocation.

function once(fn) {
    let   completed  =   false ;
    let   stored     =   null  ;
    let   error      =   null  ;
    return function(...arg){
        const callback = arg.pop();
        if(completed){
            return(callback(error ,stored));
        }
        completed =true ;
         fn(...arg, (err , data )=>{
             error = err;
             stored = data;
             callback(error , stored)

         })
         
    } 
 
}

module.exports = once;
