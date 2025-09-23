import { Router } from "express";
import { hash, verify } from "argon2";

import User from "../models/user.model";
import { createToken } from "../utils/token";

const authRoutes = Router();

authRoutes.get("/", async (req, res) => {
  const users = await User.find({});
  console.log(users);
  res.status(200).json({ data: users });
});

authRoutes.post("/login", async (req, res) => {
  try {
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ message: "Request body cannot be empty." });
    }

    const payload = req.body;

    const user = await User.findOne({
      $or: [{ email: payload.email }, { username: payload.username }],
    }).select("+passwordHashed");

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const verified = await verify(user.passwordHashed, payload.password);

    if (!verified) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const token = await createToken({
      userId: user._id.toString(),
      username: user.username,
      email: user.email,
    });

    res.status(200).json({ message: "Userlogged in", data: { token: token } });
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
      return res.status(403).json({ message: "Username already exist!" });
    }

    if (emailExist) {
      return res.status(403).json({ message: "Email already exist!" });
    }

    const passwordHashed = await hash(password);

    const payload = {
      username: username,
      email: email,
      passwordHashed: passwordHashed,
    };

    const newUser = await User.create(payload);

    const token = await createToken({
      userId: newUser._id.toString(),
      username: newUser.username,
      email: newUser.email,
    });

    res.status(201).json({
      message: "New user registered successfully",
      data: { token },
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

export default authRoutes;
