import { type Request, type Response, type NextFunction } from "express";

import { verifyToken } from "../utils/token";

import User from "../models/user.model";

import { type TokenPayload } from "../types";

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    return res.status(401).json({ message: "Missing Authorization header." });
  }

  if (!authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Invalid Authorization format. Expected 'Bearer <token>'.",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = verifyToken(token);

    if (!payload) {
      return res.status(403).json({ message: "Invalid or expired token" });
    }

    const user = await User.findById(payload.userId).select("email username");

    if (!user) {
      return res
        .status(401)
        .json({ message: "Authentication failed: User not found." });
    }

    req.user = {
      userId: user._id.toString(),
      email: user.email,
      username: user.username,
    };
    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error);
    res.status(403).json({ message: "Invalid token" });
  }
}
