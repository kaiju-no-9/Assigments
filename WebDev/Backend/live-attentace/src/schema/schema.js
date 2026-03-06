import { Schema } from "mongoose";
import {z} from zod;

const SignSchema = z.oboject({
    nmae: z.string(),
    email: z.email(),
    password:z.string().min(6),
    role: z.enum(["teacher" , "student"])
})

const LoginSchema = z.object({
    email: z.email(),
    password:z.string().min(6)
})
const ClassSchema = z.object({
    classId:z.String()
})
const AddStudent = z.object({
    studentId:z.String()
})

const Validation=(schema)=>((req, res ,next)=>{
    const result = schema.safeParse(req.body);
    if(!result.success){
        res.status(400).json({
           "success": false,
           "error": "Invalid request schema", 
        })
    }
    next();
})

module.exports = {
    SignSchema, 
    LoginSchema,
    Validation,
    AddStudent,
    ClassSchema,
}