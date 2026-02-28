
// // Problem Description – Promisify Utility
// //
// // You are given a legacy function that uses Node.js callback style:
// // (err, result) => { ... }.
// //
// // Your task is to implement promisify(fn) that converts it into a Promise-based function.
// //
// // The returned function must:
// // 1. Resolve with result if callback gets (null, result)
// // 2. Reject if callback gets an error

//const { resolve } = require("bun");

function promisify(fn) {
    return function(...arg){
        return new Promise((resolve, reject)=>{ 
        fn(...arg , (error , res)=>{
           if(error){
             return  reject(error)
           }resolve(res)
    })
})
}
}

module.exports = promisify;