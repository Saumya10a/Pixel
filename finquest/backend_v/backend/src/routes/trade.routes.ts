import { Router } from "express"
import { authRequired } from "../middleware/auth.js"
import { validate } from "../middleware/validate.js"
import { createTradeController, createTradeSchema, listTradesController } from "../controllers/trade.controller.js"

const router = Router()

router.get("/", authRequired, listTradesController)
router.post("/", authRequired, validate(createTradeSchema), createTradeController)

export default router
