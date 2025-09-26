import argon2 from "argon2";

import {
  createToken,
  generateRefreshToken,
  JWT_EXPIRATION,
} from "../utils/token";

import User from "../models/user.model";
import { LoginInput, LoginResult, RegisterInput } from "../types";

export async function loginService(
  input: LoginInput,
): Promise<LoginResult | null> {
  const { email, password } = input;

  const user = await User.findOne({ email }).select("+passwordHashed");
  if (!user) return null;

  const verified = await argon2.verify(user.passwordHashed, password);
  if (!verified) return null;

  const token = createToken({
    userId: user._id.toString(),
    username: user.username,
    email: user.email,
  });

  const refreshToken = generateRefreshToken();
  user.refreshTokens.push(refreshToken);
  await user.save();

  return {
    token,
    refreshToken,
    expiresIn: JWT_EXPIRATION,
  };
}

export async function registerService(
  input: RegisterInput,
): Promise<LoginResult> {
  const { username, email, password } = input;
  const normalizedEmail = email.toLowerCase();

  const [usernameExist, emailExist] = await Promise.all([
    User.findOne({ username }),
    User.findOne({ email: normalizedEmail }),
  ]);

  if (usernameExist) {
    throw new Error("Username already exists!");
  }

  if (emailExist) {
    throw new Error("Email already exists!");
  }

  const passwordHashed = await argon2.hash(password);

  const newUser = await User.create({
    username,
    email: normalizedEmail,
    passwordHashed,
  });

  const token = createToken({
    userId: newUser._id.toString(),
    username: newUser.username,
    email: newUser.email,
  });

  const refreshToken = generateRefreshToken();

  newUser.refreshTokens.push(refreshToken);
  await newUser.save();

  return { token, refreshToken, expiresIn: JWT_EXPIRATION };
}

export async function logoutService(refreshToken: string): Promise<boolean> {
  const result = await User.updateOne(
    { refreshTokens: refreshToken },
    { $pull: { refreshTokens: refreshToken } },
  );

  // Check if any document was modified
  return result.modifiedCount > 0;
}

export async function refreshTokenService(
  refreshToken: string,
): Promise<LoginResult | null> {
  const user = await User.findOne({ refreshTokens: refreshToken });

  if (!user) {
    return null;
  }

  const newAccessToken = createToken({
    userId: user._id.toString(),
    username: user.username,
    email: user.email,
  });

  const newRefreshToken = generateRefreshToken();

  // Replace the old refresh token
  user.refreshTokens = user.refreshTokens.filter((rt) => rt !== refreshToken);
  user.refreshTokens.push(newRefreshToken);
  await user.save();

  return {
    token: newAccessToken,
    refreshToken: newRefreshToken,
    expiresIn: JWT_EXPIRATION,
  };
}
