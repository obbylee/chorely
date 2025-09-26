import crypto from "crypto";
import jwt, { type JwtPayload } from "jsonwebtoken";

import { type TokenPayload } from "../types";

const JWT_SECRET = process.env.JWT_SECRET || "jwt_secret_key";

export const JWT_EXPIRATION = "1h";

export function createToken({
  userId,
  username,
  email,
}: {
  userId: string;
  username: string;
  email: string;
}): string {
  return jwt.sign({ userId, username, email }, JWT_SECRET, {
    expiresIn: JWT_EXPIRATION,
  });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

    if (
      typeof decoded === "object" &&
      typeof decoded.userId === "string" &&
      typeof decoded.email === "string" &&
      typeof decoded.username === "string"
    ) {
      return {
        userId: decoded.userId,
        email: decoded.email,
        username: decoded.username,
        iat: decoded.iat,
        exp: decoded.exp,
      };
    }
    console.warn("Token missing required fields");
    return null;
  } catch (error) {
    console.log("JWT validation failed:", error);
    return null;
  }
}

export function generateRefreshToken(): string {
  return crypto.randomBytes(40).toString("hex"); // secure random string
}
