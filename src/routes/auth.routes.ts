import { Router } from "express";
import rateLimit from "express-rate-limit";

import {
  login,
  register,
  logout,
  refreshToken,
} from "../controllers/auth.controller";

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: {
    message:
      "Too many login attempts from this IP, please try again after 15 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const authRoutes = Router();

authRoutes.post("/login", loginLimiter, login);
authRoutes.post("/register", register);
authRoutes.post("/logout", logout);
authRoutes.post("/refresh-token", refreshToken);

export default authRoutes;
