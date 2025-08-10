import { Router } from "express";
import { authRequired } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { listLessonsController, updateProgressController, updateProgressSchema, } from "../controllers/lesson.controller.js";
const router = Router();
router.get("/", authRequired, listLessonsController);
router.patch("/:lessonId/progress", authRequired, validate(updateProgressSchema), updateProgressController);
export default router;
