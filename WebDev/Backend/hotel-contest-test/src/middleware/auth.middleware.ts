import type  { NextFunction, Request, Response } from "express";
import { ApiErrorRespose } from "../utiles/errosresponse";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../utiles/token";
// decrating global namespace
declare global {
    namespace Express {
         export interface Request {
            id :string;
            role:"customer" | "owner";
        }
    }
}

