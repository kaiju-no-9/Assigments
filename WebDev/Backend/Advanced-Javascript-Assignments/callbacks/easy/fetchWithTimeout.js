// Problem Description – fetchWithTimeout(url, ms, callback)
//
// You are required to write a function named fetchWithTimeout that accepts a URL,
// a time limit in milliseconds, and a callback function.
// The function attempts to fetch data from the given URL.
// If the request completes within the specified time, the callback is invoked with
// null as the first argument and the fetched data as the second argument.
// If the operation exceeds the time limit, the callback is invoked with an Error
// whose message is "Request Timed Out".


function fetchWithTimeout(url, ms, callback) {
    completed = false;
   const timer =setTimeout(()=>{
    if(!completed){
        completed =true;
        callback(new Error("Request Timed Out" , null));
    }
   }, ms )

   fetch(url , (error, data)=>{
      if(!completed){
        completed = true;
        clearTimeout(timer);
        callback(error ,data);
      }
   })
    
}

module.exports = fetchWithTimeout;
