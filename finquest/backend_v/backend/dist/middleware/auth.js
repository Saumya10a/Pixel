import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
export function authRequired(req, res, next) {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) {
        return res.status(401).json({ success: false, message: "Missing Authorization header" });
    }
    try {
        const payload = jwt.verify(token, env.JWT_SECRET);
        req.user = { id: payload.id, email: payload.email };
        next();
    }
    catch {
        return res.status(401).json({ success: false, message: "Invalid or expired token" });
    }
}
