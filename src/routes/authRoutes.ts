import { Router } from "express";
import { hash, verify } from "argon2";

import User from "../models/user.model";
import {
  createToken,
  generateRefreshToken,
  JWT_EXPIRATION,
} from "../utils/token";
import rateLimit from "express-rate-limit";

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 login requests per windowMs
  message: {
    message:
      "Too many login attempts from this IP, please try again after 15 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const authRoutes = Router();

authRoutes.get("/", async (req, res) => {
  const users = await User.find({});
  res.status(200).json({ data: users });
});

authRoutes.post("/login", loginLimiter, async (req, res) => {
  try {
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ message: "Request body cannot be empty." });
    }

    const payload = req.body;

    if (!payload.email || !payload.password) {
      return res
        .status(400)
        .json({ message: "Email and password are required." });
    }

    const user = await User.findOne({ email: payload.email }).select(
      "+passwordHashed",
    );

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const verified = await verify(user.passwordHashed, payload.password);

    if (!verified) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const token = createToken({
      userId: user._id.toString(),
      username: user.username,
      email: user.email,
    });

    const refreshToken = generateRefreshToken();

    user.refreshTokens.push(refreshToken);
    await user.save();

    res.status(200).json({
      message: "User logged in",
      data: {
        token,
        refreshToken,
        expiresIn: JWT_EXPIRATION,
      },
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
});

authRoutes.post("/register", async (req, res) => {
  try {
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ message: "Request body cannot be empty." });
    }

    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res
        .status(403)
        .json({ message: "Username, email, or password cannot be empty!" });
    }

    const [usernameExist, emailExist] = await Promise.all([
      User.findOne({ username }),
      User.findOne({ email }),
    ]);

    if (usernameExist) {
      return res.status(400).json({ message: "Username already exist!" });
    }

    if (emailExist) {
      return res.status(400).json({ message: "Email already exist!" });
    }

    const passwordHashed = await hash(password);

    const payload = {
      username: username,
      email: email,
      passwordHashed: passwordHashed,
    };

    const newUser = await User.create(payload);

    const token = createToken({
      userId: newUser._id.toString(),
      username: newUser.username,
      email: newUser.email,
    });

    const refreshToken = generateRefreshToken();

    newUser.refreshTokens.push(refreshToken);
    await newUser.save();

    res.status(201).json({
      message: "New user registered successfully",
      data: { token, refreshToken },
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
});

authRoutes.post("/logout", async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ message: "Refresh token is required." });
    }

    await User.updateOne(
      { refreshTokens: refreshToken },
      { $pull: { refreshTokens: refreshToken } },
    );

    res.status(200).json({ message: "Logged out successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

authRoutes.post("/refresh-token", async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ message: "Refresh token is required." });
    }

    const user = await User.findOne({ refreshTokens: refreshToken });

    if (!user) {
      return res.status(403).json({ message: "Invalid refresh token." });
    }

    const newAccessToken = createToken({
      userId: user._id.toString(),
      username: user.username,
      email: user.email,
    });

    const newRefreshToken = generateRefreshToken();
    // Remove old one, add new one
    user.refreshTokens = user.refreshTokens.filter((rt) => rt !== refreshToken);
    user.refreshTokens.push(newRefreshToken);
    await user.save();

    res.status(200).json({
      token: newAccessToken,
      refreshToken: newRefreshToken,
      expiresIn: JWT_EXPIRATION,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default authRoutes;
