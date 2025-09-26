import { type Request, type Response } from "express";
import { type LoginInput, type RegisterInput } from "../types";
import {
  loginService,
  logoutService,
  refreshTokenService,
  registerService,
} from "../services/auth.service";

export async function login(req: Request<{}, {}, LoginInput>, res: Response) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required." });
    }

    const result = await loginService({ email, password });

    if (!result) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    res.status(200).json({
      message: "User logged in",
      data: result,
    });
  } catch (error: any) {
    console.error(error);

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map(
        (val: any) => val.message,
      );
      return res.status(400).json({ message: messages.join(", ") });
    }

    res.status(500).json({ message: "Internal server error" });
  }
}

export async function register(
  req: Request<{}, {}, RegisterInput>,
  res: Response,
) {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res
        .status(400)
        .json({ message: "Username, email, or password cannot be empty!" });
    }
    const result = await registerService({ username, email, password });

    res.status(201).json({
      message: "New user registered successfully",
      data: result,
    });
  } catch (error: any) {
    console.error(error);

    if (
      error.message === "Username already exists!" ||
      error.message === "Email already exists!"
    ) {
      return res.status(400).json({ message: error.message });
    }

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map(
        (val: any) => val.message,
      );
      return res.status(400).json({ message: messages.join(", ") });
    }

    res.status(500).json({ message: "Internal server error" });
  }
}

export async function logout(req: Request, res: Response) {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ message: "Refresh token is required." });
    }

    const removed = await logoutService(refreshToken);

    if (!removed) {
      return res.status(404).json({ message: "Refresh token not found." });
    }

    res.status(200).json({ message: "Logged out successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function refreshToken(req: Request, res: Response) {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ message: "Refresh token is required." });
    }

    const result = await refreshTokenService(refreshToken);

    if (!result) {
      return res.status(403).json({ message: "Invalid refresh token." });
    }

    res.status(200).json({
      token: result.token,
      refreshToken: result.refreshToken,
      expiresIn: result.expiresIn,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
}
