import { Router } from "express";
import { authRequired } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { meStatsController, updateProfileController, updateProfileSchema } from "../controllers/user.controller.js";
const router = Router();
router.get("/me/stats", authRequired, meStatsController);
router.patch("/me", authRequired, validate(updateProfileSchema), updateProfileController);
export default router;
