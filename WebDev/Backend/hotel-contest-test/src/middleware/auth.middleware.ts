import type { NextFunction, Request, Response } from "express";
import { ErrorResponse } from "../utiles/errosresponse";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../utiles/token";

// extending global Express namespace to add user to Request
declare global {
    namespace Express {
        export interface Request {
            user?: {
                id: string;
                role: "customer" | "owner";
            };
        }
    }
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json(ErrorResponse("UNAUTHORIZED"));
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
        return res.status(401).json(ErrorResponse("UNAUTHORIZED"));
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET!) as { id: string; role: "customer" | "owner" };
        req.user = { id: decoded.id, role: decoded.role };
        next();
    } catch {
        return res.status(401).json(ErrorResponse("UNAUTHORIZED"));
    }
};

export const requireRole = (...roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json(ErrorResponse("FORBIDDEN"));
        }
        next();
    };
};
