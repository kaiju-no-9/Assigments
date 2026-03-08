import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema({
    classId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Class",
    },
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User",
    },
    status: {
        type: String,
        enum: ["present", "absent"],
        required: true,
    },
    date: {
        type: Date,
        default: Date.now,
    },
});

export default mongoose.model("Attendance", attendanceSchema);