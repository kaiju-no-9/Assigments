import bcrypt from "bcrypt";
import { LoginSchema, SignInSchema } from "../schema/shema";
import { ErrorResponse , SuccessResponse} from "../utiles/errosresponse";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../utiles/token";
import{prisma} from "../../db";
import type {Request , Response} from "express"


export const signInController = async (req : Request, res : Response) => {
    const pasredData = SignInSchema.safeParse(req.body);

    if(!pasredData.success){
        return res.status(400).json(ErrorResponse("INVALID_REQUEST"))
    }
    const userExist = await prisma.user.findUnique({
        where : {
            email : pasredData.data.email
        }
    })
    if(userExist){
        return res.status(400).json(ErrorResponse("EMAIL_ALREADY_EXISTS"))
    }
    // password hashing
    const hashedPassword = await bcrypt.hash(pasredData.data.password, 10)
     const user = await prisma.user.create({
        data : {
            name : pasredData.data.name,
            email : pasredData.data.email,
            password : hashedPassword,
            phone : pasredData.data.phone,
            role : pasredData.data.role ?? "customer"
            // first time using select to select the fields we want to return
        },select:{
            id : true,
            role : true,
            password : true,
            name : true,
            email : true,
            phone : true,
        }
    })
    if(!user){
        return res.status(500).json(ErrorResponse("INTERNAL_SERVER_ERROR"))
    }
    
    return res.status(201).json(SuccessResponse(user))
   
   
}

 export const loginController = async (req : Request, res : Response) => {
    const pasredData = LoginSchema.safeParse(req.body);
    if(!pasredData.success){
        return res.status(400).json(ErrorResponse("INVALID_REQUEST"))
    }
    const userExist = await prisma.user.findUnique({
        where : {
            email : pasredData.data.email
        }
    })
    if(!userExist){
        return res.status(400).json(ErrorResponse("USER_NOT_FOUND"))
    }
    const isPasswordMatch = await bcrypt.compare(pasredData.data.password, userExist.password)
    if(!isPasswordMatch){
        return res.status(400).json(ErrorResponse("INVALID_CREDENTIALS"))
    }
    const token = jwt.sign({
        id : userExist.id,
        role : userExist.role
    },JWT_SECRET!)
    return res.status(200).json(SuccessResponse({
        user : userExist,
        token
    }))
}
