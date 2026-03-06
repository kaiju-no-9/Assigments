
import mongoose from "mongoose";
import { Schema} from "mongoose";

const userschema = new Schema({
    name:{
        type:string,
        required:true,
    },
    email:{
        required:true,
        unique:true,
        type:String
    },
    password:{
        required:true,
        type:String
    },
    role:{
        required:true,
        type:String,
        enum:["teacher" , "student"]
    }
})
module.export =  mongoose.model("User" , userschema)