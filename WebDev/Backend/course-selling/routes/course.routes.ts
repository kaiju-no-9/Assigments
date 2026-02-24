
import { Router } from "express";
import { createCourse, updateCourse, deleteCourse, publicCourse, getCoursewithLesson, publicLession } from "../controller/course.controller";
import { authMiddleware, requireRole } from "../middleware/authmid";

const router = Router()

router.route("/").post(authMiddleware, requireRole("INSTRUCTOR"), createCourse).get(publicCourse)
router.route("/:id").get(getCoursewithLesson).patch(authMiddleware, requireRole("INSTRUCTOR"), updateCourse).delete(authMiddleware, requireRole("INSTRUCTOR"), deleteCourse)
router.route("/:courseId/lessons").get(publicLession)

export default router