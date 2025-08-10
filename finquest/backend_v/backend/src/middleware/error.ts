import type { Request, Response, NextFunction } from "express"
import { ApiError } from "../utils/ApiError.js"

export function notFound(_req: Request, res: Response) {
  res.status(404).json({ success: false, message: "Route not found" })
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({ success: false, message: err.message, details: err.details })
  }
  console.error("Unhandled error:", err)
  return res.status(500).json({ success: false, message: "Internal Server Error" })
}
