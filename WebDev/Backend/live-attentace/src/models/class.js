import mongoose from "mongoose"
import { Schema } from "mongoose"

const userschema = new Schema({
    classId:{
       required:true,
       type:String
    },
    teacherId:{
        required:true,
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
        
    },
    studentId:[{
        type: mongoose.Schema.Types.ObjectId,
        ref:'User'
    }],
    className:{
        type:String,
        required:true
    }
})
module.export = mongoose.model("Class" , userschema)