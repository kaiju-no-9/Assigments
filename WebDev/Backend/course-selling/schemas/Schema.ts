import { z } from "zod";
  
export const  SignupSchema = z.object({
    email: z.string(),
    password :z.string().min(6),
    name : z.string(),
    role : z.enum(["STUDENT", "INSTRUCTOR"])
})

export const LoginSchema =z.object({
    email :z.string(),
    password :z.string().min(6)
})

export const CreateCourseSchema = z.object({
    title:z.string(),
    description:z.string().optional(),
    price:z.number(),
})

export const CreateLessonSchema =z.object({
    title :z.string(),
    content:z.string(),
    courseId:z.string()
})

export const PurchaseCourseSchema =z.object({
    courseId:z.string()
})