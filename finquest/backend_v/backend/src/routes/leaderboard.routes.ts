import { Router } from "express"
import { leaderboardTopController } from "../controllers/leaderboard.controller.js"

const router = Router()

router.get("/top", leaderboardTopController)

export default router
