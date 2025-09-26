export interface TokenPayload {
  userId: string;
  username: string;
  email: string;
  iat?: number; // issued at
  exp?: number; // expiration
}

export interface CreateTaskInput {
  title: string;
  description: string;
  completed?: boolean;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface LoginResult {
  token: string;
  refreshToken: string;
  expiresIn: string;
}

export interface RegisterInput {
  username: string;
  email: string;
  password: string;
}
