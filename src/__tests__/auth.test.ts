import request from "supertest";

import app from "../app";

describe("Auth Endpoints", () => {
  const testUser = {
    username: "testuser",
    email: "test@example.com",
    password: "Password123",
  };

  it("should register a user", async () => {
    const res = await request(app).post("/api/auth/register").send(testUser);

    expect(res.status).toBe(201);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.refreshToken).toBeDefined();
  });

  it("should not register user with duplicate email", async () => {
    const consoleSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    await request(app).post("/api/auth/register").send(testUser);

    const res = await request(app)
      .post("/api/auth/register")
      .send({
        ...testUser,
        username: "anotheruser", // same email, different username
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Email already exists!");
    expect(consoleSpy).toHaveBeenCalled(); // optional
    consoleSpy.mockRestore();
  });

  it("should login a registered user", async () => {
    await request(app).post("/api/auth/register").send(testUser);

    const res = await request(app).post("/api/auth/login").send({
      email: testUser.email,
      password: testUser.password,
    });

    expect(res.status).toBe(200);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.refreshToken).toBeDefined();
  });

  it("should reject login with wrong password", async () => {
    await request(app).post("/api/auth/register").send(testUser);

    const res = await request(app).post("/api/auth/login").send({
      email: testUser.email,
      password: "WrongPassword",
    });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe("Invalid credentials.");
  });

  it("should refresh access token using refresh token", async () => {
    const registerRes = await request(app)
      .post("/api/auth/register")
      .send(testUser);

    const { refreshToken } = registerRes.body.data;

    const res = await request(app)
      .post("/api/auth/refresh-token")
      .send({ refreshToken });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.refreshToken).toBeDefined();
  });

  it("should logout a user", async () => {
    const registerRes = await request(app)
      .post("/api/auth/register")
      .send(testUser);

    const { refreshToken } = registerRes.body.data;

    const res = await request(app)
      .post("/api/auth/logout")
      .send({ refreshToken });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Logged out successfully.");
  });
});
