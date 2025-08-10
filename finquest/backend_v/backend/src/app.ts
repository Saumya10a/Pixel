import express from "express"
import helmet from "helmet"
import compression from "compression"
import cookieParser from "cookie-parser"
import mongoSanitize from "express-mongo-sanitize"
// import xssClean from "xss-clean"
import rateLimit from "express-rate-limit"
import morgan from "morgan"
import { corsMiddleware } from "./config/cors.js"
import routes from "./routes/index.js"
import { notFound, errorHandler } from "./middleware/error.js"

export function createApp() {
  const app = express()

  // Security and essentials
  app.use(helmet())
  app.use(corsMiddleware)
  app.use(express.json({ limit: "1mb" }))
  app.use(express.urlencoded({ extended: true }))
  app.use(cookieParser())
  app.use(mongoSanitize())
  // app.use(xssClean())
  app.use(compression())

  // Logging and basic rate limiting
  app.use(morgan("dev"))
  app.use(
    rateLimit({
      windowMs: 60 * 1000,
      limit: 120,
      standardHeaders: true,
      legacyHeaders: false,
    }),
  )

  // Health check
  app.get("/health", (_req, res) => res.json({ ok: true }))

  // API routes
  app.use("/api", routes)

  // 404 and error handling
  app.use(notFound)
  app.use(errorHandler)

  return app
}
