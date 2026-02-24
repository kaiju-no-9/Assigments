// code for sign endpoint 

import type { Request, Response } from "express";
import { prisma } from "../db"
import { CreateCourseSchema } from "../schemas/Schema"

export const createCourse = async (req: Request, res: Response) => {
    const parseData = CreateCourseSchema.safeParse(req.body)
    if (!parseData.success) {
        return res.status(400).json({ message: parseData.error })
    }
    const { title, description, price } = parseData.data

    try {
        const course = await prisma.course.create({
            data: {
                title: title,
                description: description,
                price: price,
                // here we are assuming that the user is logged in and has an id this 
                instructorId: req.user!.id
            }
        })
        res.status(200).json({ id: course.id })
    } catch (error: any) {
        console.log(error)
        res.status(500).json({ message: "Instrutor are only one allowed to create course" })

    }

}

export const updateCourse = async (rq: Request, res: Response) => {
    const parseData = CreateCourseSchema.partial().safeParse(rq.body)
    // making it as astring 
    const courseId = rq.params.id as string
    // here i am tring to impiment a extra srtep to check if the class it empty and no update is needed
    if (!parseData.success) {
        return res.status(400).json({ message: parseData.error })
    }
    if (Object.keys(parseData.data).length === 0) {
        return res.status(400).json({ message: "No  need for update " })
    }

    try {
        const updatedCourse = await prisma.course.update({
            where: {
                id: courseId
            },
            data: parseData.data
        })
        res.status(200).json(updatedCourse)
    } catch (error: any) {
        console.log(error)
        res.status(500).json({ message: "Instrutor are only one allowed to create course" })
    }

}


export const deleteCourse = async (req: Request, res: Response) => {
    const courseId = req.params.id as string
    try {
        const deletedCourse = await prisma.course.delete({
            where: {
                id: courseId
            }
        })
        res.status(200).json({ message: "Course deleted" })
    } catch (error: any) {
        console.log(error)
        res.status(500).json({ message: "Instrutor are only one allowed to delete course" })
    }
}

//. working around lesson paths 
export const publicCourse = async (req: Request, res: Response) => {
    try {
        const course = await prisma.course.findMany({})
        res.status(200).json(course)
    } catch (error: any) {
        console.log(error)
        res.status(500).json({ message: "Internal server error" })
    }

}

export const getCoursewithLesson = async (req: Request, res: Response) => {
    const lessonId = req.params.id as string
    try {
        const course = await prisma.course.findUnique({
            where: {
                id: lessonId
            }
        })
        res.status(200).json(course)
    } catch (error: any) {
        console.log(error)
        res.status(500).json({ message: "Internal server error3" })
    }
}


export const publicLession = async (req: Request, res: Response) => {
    const courseId = req.params.courseId as string
    try {
        const lesson = await prisma.lesson.findMany({
            where: {
                courseId
            }
        })
        res.status(200).json(lesson)
    } catch (error: any) {
        console.log(error)
        res.status(500).json({ message: "Internal server error4" })
    }
}
