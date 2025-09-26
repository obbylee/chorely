import request from "supertest";

import User from "../models/user.model";
import Task from "../models/task.model";

import app from "../app";
import { createToken } from "../utils/token";

export async function createTestUser() {
  const user = await User.create({
    username: "testuser",
    email: "test@example.com",
    passwordHashed: "somehashedpass",
    refreshTokens: [],
  });

  const userId = user._id.toString();

  const token = createToken({
    userId: user._id.toString(),
    username: user.username,
    email: user.email,
  });

  return { userId, token };
}

describe("Task Routes", () => {
  it("should create a new task", async () => {
    const { userId, token } = await createTestUser();

    const res = await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Test Task",
        description: "Do something important",
      });

    expect(res.status).toBe(201);
    expect(res.body.data).toHaveProperty("_id");
    expect(res.body.data.title).toBe("Test Task");
    expect(res.body.data.owner).toBe(userId);
  });

  it("should fetch tasks for current user", async () => {
    const { token } = await createTestUser();

    // Pre-create a task in DB for this user
    await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Sample Task",
        description: "Sample Description",
      });

    const res = await request(app)
      .get("/api/tasks")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data[0].title).toBe("Sample Task");
  });

  it("should update a task", async () => {
    const { userId, token } = await createTestUser();

    const task = await Task.create({
      title: "Old Title",
      description: "Old Desc",
      owner: userId,
    });

    const res = await request(app)
      .patch(`/api/tasks/${task._id.toString()}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Updated Title" });

    expect(res.status).toBe(200);
    expect(res.body.data.title).toBe("Updated Title");
  });

  it("should delete a task", async () => {
    const { userId, token } = await createTestUser();

    const task = await Task.create({
      title: "To Be Deleted",
      description: "Desc",
      owner: userId,
    });

    const res = await request(app)
      .delete(`/api/tasks/${task._id.toString()}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/deleted/i);

    // Ensure task is deleted from DB
    const deletedTask = await Task.findById(task._id);
    expect(deletedTask).toBeNull();
  });
});
