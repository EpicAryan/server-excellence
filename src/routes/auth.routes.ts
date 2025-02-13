import { Router } from "express";
import { signup, login, logout } from "../controllers";
import { authenticate } from "../middleware/auth.middleware";
const router = Router();

router.post("/signup", signup);
router.post("/login", login);
// router.post("/refresh-token", authenticate, refreshToken);
router.post("/logout", authenticate, logout);

export default router;
