import mongoose from 'mongoose';

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const { JWT_SECRET } = require('../middleware/auth');
import {SignSchema, LoginSchema,} from "../schema/schema"
import { success } from 'zod';

export const  signup = async (req ,res)=>{
    const paraData = SignSchema.safePrase(req.body)
    if(!paraData.success){
        res.status(400).json({
            "success": false,
            "error": "Invalid request schema",
        })
       
    }
    const { email, password, name, role } = paraData.data;
    try { 
    const isexisting = await  mongoose.findOne({
        email:email
    })
    if(isexisting){
        res.status(400).json({
            "success": false,
            "error": "Email already exists"
        })
    }
    const hashed = await bcrypt.hash(password , 10)
    const user =  await mongoose.create({
        name,
        password:hashed,
        email,
        role  

    })
    return res.send(201).json({
        success:true,
        data:{
            _id : user._id,
            name :user.name,
            email:user.email,
            role : user.role

        }
    })
}catch(error){
    res.status(500).json({
        success: false,
        error: error.message
    })

}
    
}

export const login = async (req , res)=>{
    const paraData = LoginSchema.safePrase(req.body)
    const {email , password}= paraData.data
    if(!paraData.success){
        res.status(400).json({
            "success": false,
            "error": "Invalid request schema",
        })
    }
    try{
    const existuser = await User.findOne({email:email})
    if(!existuser){
        res.status(400).json({
             "success": false,
              "error": "Invalid email or password"
        })

    }
    const validate = await bcrypt.compare(password ,  existuser.password)
    if(!validate){
        res.status(400).json({
            "success": false,
             "error": "Invalid email or password"
       })

    }
    const token = jwt.sign(
        {
        id:existuser._id,
        role:existuser.role
        }  ,
        process.env.JWT_SECRET
          
    )
    res.status(200).json({
        "success": true,
    "data": {
    "token": token
       }
    })
}catch(error){
    res.status(500).json({
        success: false,
        error: error.message
    })
}

}
export const  me =  async(req,res)=>{
    try{
    const user = await User.findById(req.userId).select("-password");
    if(!user){
        res.status(404).json({
             "success": false,
             "error": "User not found"
        })
    }
    res.satus(200).json({
    "success": true,
    "data": {
    "_id": user._id,
    "name": user.name,
    "email": user.email,
    "role": user.role
  }
    })
}catch(error){
    res.status(500).json({
        success: false,
        error: error.message
    })
}
}

export const ClassInfo = async(req,res)=>{
    const {id}= req.params
    const classDoc = await ClassInfo.findById(id).populate("studentIds" , "_id name  email")
    if(!classDoc){
        return res.status(404).json({
            success: false,
            error: 'Class not found'
          
    }
)}
    

}