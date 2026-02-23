
import exppress from"express"
import {prisma } from "./db"

const app = exppress()

app.use(exppress.json())

import { authMiddleware , requireRole } from "./middleware/authmid"


// try catch block for the runnig of the server 
try{
    app.listen(3000,()=>{
        console.log("server is running on port 3000")
    })
}catch(error){
    console.log(error)

}
