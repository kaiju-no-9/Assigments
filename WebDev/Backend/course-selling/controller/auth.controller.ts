import  type { Request,Response } from "express";
import {prisma}  from "../db"
import{z} from "zod"
import {SignupSchema,LoginSchema} from "../schemas/Schema"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

export const signup = async (req:Request,res:Response)=>{
     const Pased = SignupSchema.safeParse(req.body) 
     if(!Pased.success){
        return res.status(400).json({message:Pased.error})
     }
        const {email, password, role , name} = Pased.data;
    try{
        
         
         const hash_password= bcrypt.hashSync(password,10)
        const user = await prisma.user.create({
            // here a error occured beacuse not working around seting up default value in schema
            data:{
                // for returnig undefiend if not there ohter wise give error 
                email:email,
                password :hash_password ,
                role:role,
                name:name
            }
        })  
        res.status(201).json({message:"Created User" })    
    }catch(error:any){
        console.log(error)
         res.status(500).json({message:"Internal Server Eroor"})        
    }
}

//.......................

export const login = async(req:Request, res:Response)=>{
    const parseData = LoginSchema.safeParse(req.body)
    if(!parseData.success){
        return  res.status(400).json({"message": parseData.error})
    }
    // user exist or not 
    try{
        // is alwayse recommned here to use safe parse  
        const {email , password} = parseData.data;
        const exists= await prisma.user.findFirst({
            where :{ email : email  }
        });
        if (!exists){
            return res.sendStatus(401).json({message:"the user noot found "})}

        const checkvalue = await bcrypt.compare (
            password,
             exists.password
        )
        if(!checkvalue){
            return res.status(400).json({message:"Invalid Password"})
        }
        const token = jwt.sign({id:exists.id},"secret",{expiresIn:"1h"})
        res.status(200).json({message:"Login Success",token})
    }catch(error:any){
        console.log(error)
        res.status(500).json({message:"Internal Server Eroor1"})

    }

}

