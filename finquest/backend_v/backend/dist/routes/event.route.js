import { Router } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { bus } from "../events/bus.js";
const router = Router();
// GET /api/events?token=JWT
router.get("/", (req, res) => {
    const token = String(req.query.token || "");
    if (!token)
        return res.status(401).end();
    try {
        const payload = jwt.verify(token, env.JWT_SECRET);
        const userId = payload.id;
        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Connection", "keep-alive");
        res.flushHeaders?.();
        const keepAlive = setInterval(() => {
            res.write("event: ping\ndata: {}\n\n");
        }, 25000);
        const listener = (evt) => {
            res.write(`data: ${JSON.stringify(evt)}\n\n`);
        };
        bus.on(`user:${userId}`, listener);
        req.on("close", () => {
            clearInterval(keepAlive);
            bus.off(`user:${userId}`, listener);
            res.end();
        });
    }
    catch {
        return res.status(401).end();
    }
});
export default router;
