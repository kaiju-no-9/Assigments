import mongoose from "mongoose"
import { Schema } from "mongoose"


const  attendenceschema = new Schema({
    classId:{
       type :mongoose.Schema.Types.ObjectId,
       required:true,
       ref:"Class"
       
    },
    studentId:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    status:{
        type:String,
        enum: ["present" , "absent"],
        required:true
    }

})
expoet.models = moongoose.model("Attendence" , attendenceschema)