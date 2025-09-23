import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "jwt_secret_key";

const JWT_EXPIRATION = "1h";

export async function createToken({
  userId,
  username,
  email,
}: {
  userId: string;
  username: string;
  email: string;
}) {
  return jwt.sign({ userId, username, email }, JWT_SECRET, {
    expiresIn: JWT_EXPIRATION,
  });
}

export function verifyToken(token: string) {
  return jwt.verify(token, JWT_SECRET);
}
