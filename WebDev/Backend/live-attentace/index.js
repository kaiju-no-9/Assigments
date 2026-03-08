import express from "express";
import http from "http";
import connectDB from "./db.js";
import authRoutes from "./src/routes/auth.routes.js";
import classRoutes from "./src/routes/class.routes.js";
import attendanceRoutes from "./src/routes/attendance.routes.js";
import studentRoutes from "./src/routes/student.routes.js";
import { getMyAttendance } from "./src/controllers/attentence.controller.js";
import { authMiddleware } from "./src/middleware/auth.js";
import AttendanceWebSocketServer from "./src/websocket/webSocket.js";

const app = express();

app.use(express.json());


app.use("/auth", authRoutes);


app.get("/class/:id/my-attendance", authMiddleware, getMyAttendance);

app.use("/class", classRoutes);
app.use("/attendance", attendanceRoutes);
app.use("/students", studentRoutes);


const server = http.createServer(app);
new AttendanceWebSocketServer(server);


const PORT = process.env.PORT || 3000;

connectDB().then(() => {
    server.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
});

export default app;
