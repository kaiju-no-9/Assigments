import { WebSocketServer } from "ws";
import jwt from "jsonwebtoken";
import url from "url";
import { JWT_SECRET } from "../middleware/auth.js";
import {
    getActiveSession,
    clearActiveSession,
} from "../controllers/attentence.controller.js";
import Class from "../models/class.js";
import Attendance from "../models/attendence.js";

export default class AttendanceWebSocketServer {
    constructor(server) {
        this.wss = new WebSocketServer({ server, path: "/ws" });
        this.init();
    }

    init() {
        this.wss.on("connection", (ws, req) => this.handleConnection(ws, req));
    }

    // Broadcast to all connected clients
    broadcast(data) {
        const message = JSON.stringify(data);
        this.wss.clients.forEach((client) => {
            if (client.readyState === 1) {
                // WebSocket.OPEN === 1
                client.send(message);
            }
        });
    }

    // Send message to a specific client
    sendToClient(ws, data) {
        if (ws.readyState === 1) {
            ws.send(JSON.stringify(data));
        }
    }

    sendError(ws, message) {
        this.sendToClient(ws, {
            event: "ERROR",
            data: { message },
        });
    }

    handleConnection(ws, req) {
        const parsedUrl = url.parse(req.url, true);
        const token = parsedUrl.query.token;

        if (!token) {
            this.sendError(ws, "Unauthorized or invalid token");
            ws.close();
            return;
        }

        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            ws.user = {
                userId: decoded.id.toString(),
                role: decoded.role,
            };
        } catch (error) {
            this.sendError(ws, "Unauthorized or invalid token");
            ws.close();
            return;
        }

        // Listen for messages from this client
        ws.on("message", (message) => this.handleMessage(ws, message));
    }

    async handleMessage(ws, message) {
        try {
            const parsedData = JSON.parse(message.toString());
            const { event, data } = parsedData;

            switch (event) {
                case "ATTENDANCE_MARKED":
                    await this.handleAttendanceMarked(ws, data);
                    break;
                case "TODAY_SUMMARY":
                    await this.handleTodaySummary(ws);
                    break;
                case "MY_ATTENDANCE":
                    await this.handleMyAttendance(ws);
                    break;
                case "DONE":
                    await this.handleDone(ws);
                    break;
                default:
                    this.sendError(ws, "Unknown event");
                    break;
            }
        } catch (error) {
            this.sendError(ws, "Invalid message format");
        }
    }

    async handleAttendanceMarked(ws, data) {
        if (ws.user.role !== "teacher") {
            this.sendError(ws, "Forbidden, teacher event only");
            return;
        }

        const session = getActiveSession();
        if (!session || session.teacherId !== ws.user.userId) {
            this.sendError(ws, "No active attendance session");
            return;
        }

        const { studentId, status } = data;

        // Store attendance in the active session
        session.attendance[studentId] = status;

        this.broadcast({
            event: "ATTENDANCE_MARKED",
            data: {
                studentId,
                status,
            },
        });
    }

    async handleTodaySummary(ws) {
        if (ws.user.role !== "teacher") {
            this.sendError(ws, "Forbidden, teacher event only");
            return;
        }

        const session = getActiveSession();
        if (!session || session.teacherId !== ws.user.userId) {
            this.sendError(ws, "No active attendance session");
            return;
        }

        const attendanceValues = Object.values(session.attendance);
        const present = attendanceValues.filter((s) => s === "present").length;
        const absent = attendanceValues.filter((s) => s === "absent").length;
        const total = attendanceValues.length;

        this.broadcast({
            event: "TODAY_SUMMARY",
            data: {
                present,
                absent,
                total,
            },
        });
    }

    async handleMyAttendance(ws) {
        if (ws.user.role !== "student") {
            this.sendError(ws, "Forbidden, student event only");
            return;
        }

        const session = getActiveSession();
        if (!session) {
            this.sendError(ws, "No active attendance session");
            return;
        }

        // Verify student is enrolled in the session's class
        const classDoc = await Class.findById(session.classId);
        if (!classDoc || !classDoc.studentIds.some(id => id.toString() === ws.user.userId)) {
            this.sendError(ws, "No active attendance session");
            return;
        }

        const status = session.attendance[ws.user.userId] || "not yet updated";

        // Unicast — only send to the requesting student
        this.sendToClient(ws, {
            event: "MY_ATTENDANCE",
            data: {
                status,
            },
        });
    }

    async handleDone(ws) {
        if (ws.user.role !== "teacher") {
            this.sendError(ws, "Forbidden, teacher event only");
            return;
        }

        const session = getActiveSession();
        if (!session || session.teacherId !== ws.user.userId) {
            this.sendError(ws, "No active attendance session");
            return;
        }

        try {
            const classDoc = await Class.findById(session.classId);
            if (!classDoc) {
                this.sendError(ws, "Class not found");
                return;
            }

            // Mark all unmarked students as absent
            for (const studentId of classDoc.studentIds) {
                const sid = studentId.toString();
                if (!session.attendance[sid]) {
                    session.attendance[sid] = "absent";
                }
            }

            // Build attendance records for persistence
            const attendanceRecords = Object.entries(session.attendance).map(
                ([studentId, status]) => ({
                    classId: session.classId,
                    studentId,
                    status,
                })
            );

            // Persist to MongoDB using bulkWrite
            if (attendanceRecords.length > 0) {
                await Attendance.bulkWrite(
                    attendanceRecords.map((record) => ({
                        updateOne: {
                            filter: {
                                classId: record.classId,
                                studentId: record.studentId,
                            },
                            update: { $set: record },
                            upsert: true,
                        },
                    }))
                );
            }

            const attendanceValues = Object.values(session.attendance);
            const present = attendanceValues.filter((s) => s === "present").length;
            const absent = attendanceValues.filter((s) => s === "absent").length;
            const total = attendanceValues.length;

            // Clear the active session
            clearActiveSession();

            this.broadcast({
                event: "DONE",
                data: {
                    message: "Attendance persisted",
                    present,
                    absent,
                    total,
                },
            });
        } catch (error) {
            this.sendError(ws, "Failed to mark attendance");
        }
    }
}