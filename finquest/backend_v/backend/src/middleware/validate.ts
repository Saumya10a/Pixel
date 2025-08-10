import type { Request, Response, NextFunction } from "express"
import type { ZodSchema } from "zod"

export function validate(schema: ZodSchema, where: "body" | "query" | "params" = "body") {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[where])
    if (!result.success) {
      return res.status(400).json({ success: false, message: "Validation error", details: result.error.flatten() })
    }
    ;(req as any)[where] = result.data
    next()
  }
}
