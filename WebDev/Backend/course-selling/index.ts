
import exppress from "express"
import type { Request, Response } from "express"
import { prisma } from "./db"

const app = exppress()

app.use(exppress.json())

import { authMiddleware, requireRole } from "./middleware/authmid"
import UserRouter from "./routes/user.routes"
import CourseRouter from "./routes/course.routes"
import { PurchaseCourseSchema, CreateLessonSchema } from "./schemas/Schema"

app.use("/auth", UserRouter)
app.use("/courses", CourseRouter)

app.get("/me", authMiddleware, async (req: Request, res: Response) => {
    const user = await prisma.user.findFirst({
        where: {
            id: req.user!.id,
            role: req.user!.role
        }
    })
    res.json({
        id: req.user!.id,
        role: req.user!.role,
        email: user?.email
    })
})

// lesson end point 
app.post("/lessons", authMiddleware, requireRole("INSTRUCTOR"), async (req: Request, res: Response) => {
    const parsedData = CreateLessonSchema.safeParse(req.body)
    if (!parsedData.success) {
        res.status(400).json({ message: "invalid input" })
        return
    }
    const lesson = await prisma.lesson.create({
        data: {
            title: parsedData.data?.title!,
            content: parsedData.data?.content!,
            courseId: parsedData.data?.courseId!
        }
    })
    res.json(lesson)
})

// purchase endpoint
app.post("/purchases", authMiddleware, requireRole("STUDENT"), async (req: Request, res: Response) => {
    const parsedData = PurchaseCourseSchema.safeParse(req.body)
    if (!parsedData.success) {
        res.status(400).json({ message: "invalid input" })
        return
    }
    try {
        // check if already purchased
        const existing = await prisma.purchase.findFirst({
            where: {
                userId: req.user!.id,
                courseId: parsedData.data.courseId
            }
        })
        if (existing) {
            res.status(409).json({ message: "Already purchased" })
            return
        }
        const purchase = await prisma.purchase.create({
            data: {
                userId: req.user!.id,
                courseId: parsedData.data.courseId
            }
        })
        res.status(200).json(purchase)
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Internal server error" })
    }
})

// get user purchases
app.get("/users/:id/purchases", authMiddleware, requireRole("STUDENT"), async (req: Request, res: Response) => {
    const userId = req.params.id as string
    // ownership check — students can only view their own purchases
    if (req.user!.id !== userId) {
        res.status(403).json({ message: "Forbidden" })
        return
    }
    const purchases = await prisma.purchase.findMany({
        where: {
            userId
        },
        include: {
            course: true
        }
    })
    res.json(purchases)
})


// try catch block for the runnig of the server 
try {
    app.listen(3000, () => {
        console.log("server is running on port 3000")
    })
} catch (error) {
    console.log(error)

}
