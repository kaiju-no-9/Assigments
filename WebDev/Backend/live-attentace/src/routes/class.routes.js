import { Router } from "express";
import {
    createClass,
    addStudent,
    getClassInfo,
} from "../controllers/class.controller.js";
import { authMiddleware, requireTeacher } from "../middleware/auth.js";

const router = Router();

router.post("/", authMiddleware, requireTeacher, createClass);
router.post("/:id/add-student", authMiddleware, requireTeacher, addStudent);
router.get("/:id", authMiddleware, getClassInfo);

export default router;
