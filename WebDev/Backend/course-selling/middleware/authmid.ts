import jwt from "jsonwebtoken";
import type { NextFunction, Request, Response } from "express";

declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                role: "STUDENT" | "INSTRUCTOR"
            }
        }
    }
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split("Bearer ")[1];
    if (!token) {
        return res.status(401).json({ messsage: "givin token is invalid" })
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret") as {
            id: string;
            role: "STUDENT" | "INSTRUCTOR"
        }
        req.user = decoded;
        next();

    } catch (error) {
        return res.status(401).json({ messsage: "givin token is invalid" })
    }

}

export const requireRole = (role: "STUDENT" | "INSTRUCTOR") => {
    return (req: Request, res: Response, next: NextFunction) => {
        // checking for id validation for  the user to check if it is correct ?
        if (req.user?.role !== role) {
            return res.status(403).json({ messsage: "not authorized to access" })
        }
        if (!req.user?.id) {
            return res.status(401).json({ messsage: "not authorized to access" })
        }
        next();

    }
}
