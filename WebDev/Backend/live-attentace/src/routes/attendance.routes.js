import { Router } from "express";
import {
    startSession,
    getMyAttendance,
} from "../controllers/attentence.controller.js";
import { authMiddleware, requireTeacher } from "../middleware/auth.js";

const router = Router();

router.post("/start", authMiddleware, requireTeacher, startSession);

export default router;

// Export getMyAttendance separately — it's mounted at /class/:id/my-attendance in index.js
export { getMyAttendance };
