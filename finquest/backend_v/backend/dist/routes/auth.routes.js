import { Router } from "express";
import { validate } from "../middleware/validate.js";
import { authRequired } from "../middleware/auth.js";
import { registerController, registerSchema, loginController, loginSchema, meController, } from "../controllers/auth.controller.js";
const router = Router();
router.post("/register", validate(registerSchema), registerController);
router.post("/login", validate(loginSchema), loginController);
router.get("/me", authRequired, meController);
export default router;
