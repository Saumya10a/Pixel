import cors from "cors"
import { env } from "./env"

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:8080"
];

export const corsMiddleware = cors({
  origin: (origin, callback) => {
    if (!origin || env.CORS_ORIGIN === "*" || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
});