import { Router } from "express";
import { getStudents } from "../controllers/class.controller.js";
import { authMiddleware, requireTeacher } from "../middleware/auth.js";

const router = Router();

router.get("/", authMiddleware, requireTeacher, getStudents);

export default router;
