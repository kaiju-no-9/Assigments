import Class from "../models/class.js";
import Attendance from "../models/attendence.js";
import { ClassIdSchema } from "../schema/schema.js";

// In-memory active session
let activeSession = null;

export const getActiveSession = () => {
    return activeSession;
};

export const clearActiveSession = () => {
    activeSession = null;
};

export const startSession = async (req, res) => {
    const parsed = ClassIdSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({
            success: false,
            error: "Invalid request schema",
        });
    }

    try {
        const { classId } = parsed.data;
        const teacherId = req.userId;

        const classDoc = await Class.findById(classId);
        if (!classDoc) {
            return res.status(404).json({
                success: false,
                error: "Class not found",
            });
        }

        if (classDoc.teacherId.toString() !== teacherId) {
            return res.status(403).json({
                success: false,
                error: "Forbidden, not class teacher",
            });
        }

        activeSession = {
            classId: classId,
            teacherId: teacherId,
            startedAt: new Date().toISOString(),
            attendance: {},
        };

        return res.status(200).json({
            success: true,
            data: {
                classId: activeSession.classId,
                startedAt: activeSession.startedAt,
            },
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: "Internal server error",
        });
    }
};

export const getMyAttendance = async (req, res) => {
    try {
        const classId = req.params.id;
        const studentId = req.userId;

        const classDoc = await Class.findById(classId);
        if (!classDoc) {
            return res.status(404).json({
                success: false,
                error: "Class not found",
            });
        }

        if (req.role !== "student") {
            return res.status(403).json({
                success: false,
                error: "Forbidden, student access required",
            });
        }

        const isEnrolled = classDoc.studentIds.some(
            (id) => id.toString() === studentId
        );
        if (!isEnrolled) {
            return res.status(403).json({
                success: false,
                error: "Forbidden, not enrolled in class",
            });
        }

        // Check persisted attendance first
        const record = await Attendance.findOne({
            classId,
            studentId,
        });

        return res.status(200).json({
            success: true,
            data: {
                classId,
                status: record ? record.status : null,
            },
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: "Internal server error",
        });
    }
};