// Problem Description – retryOnce(fn)
//
// You are given a function `fn` that returns a Promise.
// Your task is to return a new function that calls `fn` and retries it once
// if the first attempt rejects.
// If the second attempt also rejects, the error should be propagated.


function retryOnce(fn) {
    return  function(...args){
        const  callback = args.pop();
        fn(...args , (err1 , data)=>{
            if(!err1){ 
            callback(null , data);
            }
        })
        fn(...args , (err2 , data2)=>{
            if(!err2){
                return callback(null ,data2);
            }else{
                return callback(err2 , null);
            }
        })
    }

}

module.exports = retryOnce;
