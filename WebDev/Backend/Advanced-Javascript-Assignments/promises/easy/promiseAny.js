// Problem Description – promiseAny(promises)

// You are required to implement a function named promiseAny that accepts an array of Promises. 
// The function should return a new Promise that resolves immediately when any one of the input promises resolves successfully. 
// If all the promises reject, the returned Promise should reject with an error.
function promiseAny(promises) {
    return new Promise((resolve, reject)=>{
        const res =[];
        let err = 0;
         if (promises.length === 0){
              return reject(new AggregateError([],"Empty iterable"));
         }
         promises.forEach((item , index)=>{
              Promise.resolve(item).then((value)=>{
                  resolve(value); 
              }).catch((e)=>{
                  res[index]= e;
                   err++
                   if(err=== promises.length){
                    return reject(new AggregateError(res, "All promises were rejected"));
                  }
    
              })
              
            
         })
    })
}

module.exports = promiseAny;
