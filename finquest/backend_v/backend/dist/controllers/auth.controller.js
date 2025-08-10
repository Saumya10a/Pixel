import { StatusCodes } from "http-status-codes";
import { z } from "zod";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/user.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { env } from "../config/env.js";
export const registerSchema = z.object({
    name: z.string().min(2).max(64),
    email: z.string().email(),
    password: z.string().min(6),
});
export const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
});
function signToken(id, email) {
    return jwt.sign({ id, email }, env.JWT_SECRET, { expiresIn: "7d" });
}
export async function registerController(req, res) {
    const { name, email, password } = req.body;
    const existing = await User.findOne({ email });
    if (existing)
        throw new ApiError(StatusCodes.CONFLICT, "Email is already registered");
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
        name,
        email,
        passwordHash,
        xp: 0,
        streak: 0,
        badges: [],
        rankPercent: 100,
    });
    const token = signToken(user.id, user.email);
    const safeUser = {
        id: user.id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl || null,
        xp: user.xp,
        streak: user.streak,
        badges: user.badges,
        rankPercent: user.rankPercent,
    };
    return res.status(StatusCodes.CREATED).json(new ApiResponse("Registration successful", { token, user: safeUser }));
}
export async function loginController(req, res) {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user)
        throw new ApiError(StatusCodes.UNAUTHORIZED, "Invalid credentials");
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok)
        throw new ApiError(StatusCodes.UNAUTHORIZED, "Invalid credentials");
    const token = signToken(user.id, user.email);
    const safeUser = {
        id: user.id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl || null,
        xp: user.xp,
        streak: user.streak,
        badges: user.badges,
        rankPercent: user.rankPercent,
    };
    return res.json(new ApiResponse("Login successful", { token, user: safeUser }));
}
export async function meController(req, res) {
    const user = await User.findById(req.user.id);
    if (!user)
        throw new ApiError(StatusCodes.UNAUTHORIZED, "User not found");
    const safeUser = {
        id: user.id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl || null,
        xp: user.xp,
        streak: user.streak,
        badges: user.badges,
        rankPercent: user.rankPercent,
    };
    return res.json(new ApiResponse("Current user", safeUser));
}
