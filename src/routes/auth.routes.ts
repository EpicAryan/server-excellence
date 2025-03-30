import { Router } from "express";
import { signup, login, logout } from "../controllers";
import { authenticate } from "../middleware/auth.middleware";
import { validate } from "../middleware/schemaValidate.middleware";
import { signUpSchema, loginSchema } from "../schemas/auth.schema";

const router = Router();

router.post("/signup", validate(signUpSchema), signup);
router.post("/login", validate(loginSchema), login);
// router.post("/refresh-token", authenticate, refreshToken);
router.post("/logout", authenticate, logout);

export default router;
