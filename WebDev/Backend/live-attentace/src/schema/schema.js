import { z } from "zod";

export const SignSchema = z.object({
    name: z.string(),
    email: z.string().email(),
    password: z.string().min(6),
    role: z.enum(["teacher", "student"]),
});

export const LoginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
});

export const ClassSchema = z.object({
    className: z.string(),
});

export const AddStudentSchema = z.object({
    studentId: z.string(),
});

export const ClassIdSchema = z.object({
    classId: z.string(),
});