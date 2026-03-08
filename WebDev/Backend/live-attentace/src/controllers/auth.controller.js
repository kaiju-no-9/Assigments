import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/user.js";
import { SignSchema, LoginSchema } from "../schema/schema.js";
import { JWT_SECRET } from "../middleware/auth.js";

export const signup = async (req, res) => {
    const parsed = SignSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({
            success: false,
            error: "Invalid request schema",
        });
    }

    const { email, password, name, role } = parsed.data;

    try {
        const existing = await User.findOne({ email });
        if (existing) {
            return res.status(400).json({
                success: false,
                error: "Email already exists",
            });
        }

        const hashed = await bcrypt.hash(password, 10);
        const user = await User.create({
            name,
            password: hashed,
            email,
            role,
        });

        return res.status(201).json({
            success: true,
            data: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: error.message,
        });
    }
};

export const login = async (req, res) => {
    const parsed = LoginSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({
            success: false,
            error: "Invalid request schema",
        });
    }

    const { email, password } = parsed.data;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({
                success: false,
                error: "Invalid email or password",
            });
        }

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) {
            return res.status(400).json({
                success: false,
                error: "Invalid email or password",
            });
        }

        const token = jwt.sign(
            { id: user._id, role: user.role },
            JWT_SECRET
        );

        return res.status(200).json({
            success: true,
            data: {
                token,
            },
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: error.message,
        });
    }
};

export const me = async (req, res) => {
    try {
        const user = await User.findById(req.userId).select("-password");
        if (!user) {
            return res.status(404).json({
                success: false,
                error: "User not found",
            });
        }

        return res.status(200).json({
            success: true,
            data: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: error.message,
        });
    }
};
