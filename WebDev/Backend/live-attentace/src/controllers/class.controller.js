import Class from "../models/class.js";
import User from "../models/user.js";
import { ClassSchema, AddStudentSchema } from "../schema/schema.js";

export const createClass = async (req, res) => {
    const parsed = ClassSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({
            success: false,
            error: "Invalid request schema",
        });
    }

    try {
        const { className } = parsed.data;
        const teacherId = req.userId;

        const newClass = await Class.create({
            className,
            teacherId,
            studentIds: [],
        });

        return res.status(201).json({
            success: true,
            data: {
                _id: newClass._id,
                className: newClass.className,
                teacherId: newClass.teacherId,
                studentIds: newClass.studentIds,
            },
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: "Internal server error",
        });
    }
};

export const addStudent = async (req, res) => {
    const parsed = AddStudentSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({
            success: false,
            error: "Invalid request schema",
        });
    }

    try {
        const { studentId } = parsed.data;
        const classId = req.params.id;

        const classDoc = await Class.findById(classId);
        if (!classDoc) {
            return res.status(404).json({
                success: false,
                error: "Class not found",
            });
        }

        if (classDoc.teacherId.toString() !== req.userId) {
            return res.status(403).json({
                success: false,
                error: "Forbidden, not class teacher",
            });
        }

        const student = await User.findById(studentId);
        if (!student || student.role !== "student") {
            return res.status(404).json({
                success: false,
                error: "Student not found",
            });
        }

        // Avoid duplicates
        if (!classDoc.studentIds.map((id) => id.toString()).includes(studentId)) {
            classDoc.studentIds.push(studentId);
            await classDoc.save();
        }

        return res.status(200).json({
            success: true,
            data: {
                _id: classDoc._id,
                className: classDoc.className,
                teacherId: classDoc.teacherId,
                studentIds: classDoc.studentIds.map((id) => id.toString()),
            },
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: "Internal server error",
        });
    }
};

export const getClassInfo = async (req, res) => {
    try {
        const { id } = req.params;

        const classDoc = await Class.findById(id).populate(
            "studentIds",
            "_id name email"
        );

        if (!classDoc) {
            return res.status(404).json({
                success: false,
                error: "Class not found",
            });
        }

        const isTeacher =
            classDoc.teacherId.toString() === req.userId && req.role === "teacher";
        const isEnrolledStudent =
            classDoc.studentIds.some(
                (s) => s._id.toString() === req.userId
            ) && req.role === "student";

        if (!isTeacher && !isEnrolledStudent) {
            return res.status(403).json({
                success: false,
                error: "Forbidden, not class teacher",
            });
        }

        return res.status(200).json({
            success: true,
            data: {
                _id: classDoc._id,
                className: classDoc.className,
                teacherId: classDoc.teacherId,
                students: classDoc.studentIds.map((student) => ({
                    _id: student._id,
                    name: student.name,
                    email: student.email,
                })),
            },
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: "Internal server error",
        });
    }
};

export const getStudents = async (req, res) => {
    try {
        const students = await User.find({ role: "student" }).select(
            "_id name email"
        );

        return res.status(200).json({
            success: true,
            data: students.map((s) => ({
                _id: s._id,
                name: s.name,
                email: s.email,
            })),
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: "Internal server error",
        });
    }
};