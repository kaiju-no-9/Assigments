import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

export { JWT_SECRET };

export const authMiddleware = (req, res, next) => {
    const token = req.headers.authorization;
    if (!token) {
        return res.status(401).json({
            success: false,
            error: "Unauthorized, token missing or invalid",
        });
    }
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.userId = decoded.id;
        req.role = decoded.role;
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            error: "Unauthorized, token missing or invalid",
        });
    }
};

export const requireTeacher = (req, res, next) => {
    if (req.role !== "teacher") {
        return res.status(403).json({
            success: false,
            error: "Forbidden, teacher access required",
        });
    }
    next();
};