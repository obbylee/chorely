import mongoose from "mongoose";
import { Router } from "express";

import Task from "../models/task.model";

import { authMiddleware } from "../middlewares/authMiddleware";
import { TokenPayload } from "../utils/token";

interface CreateTaskInput {
  title: string;
  description: string;
  completed?: boolean;
}

const tasksRoutes = Router();

tasksRoutes.get("/", authMiddleware, async (req, res) => {
  try {
    const user = req.user;

    if (!user?.userId) {
      return res.status(401).json({ message: "Invalid token payload" });
    }

    const tasks = await Task.find({ owner: user.userId });
    res.status(200).json({ data: tasks });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

tasksRoutes.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const isValidId = mongoose.Types.ObjectId.isValid(id);

    if (!isValidId) {
      return res.status(400).json({ message: "Invalid task ID" });
    }

    const task = await Task.findById(id);

    if (!task) {
      return res.json({ message: "Task not found." });
    }

    res.status(200).json({ data: task });
  } catch (error: any) {
    console.log(error);

    res.status(500).json({ message: "Internal server error" });
  }
});

tasksRoutes.post("/", authMiddleware, async (req, res) => {
  try {
    const reqBody = req.body as CreateTaskInput;
    const user = req.user as TokenPayload;

    if (!user?.userId) {
      return res.status(401).json({ message: "Invalid token payload" });
    }

    const task = await Task.create({ ...reqBody, owner: user.userId });

    res.status(201).json({ data: task });
  } catch (error: any) {
    console.error("Create task error:", error);

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map(
        (val: any) => val.message,
      );
      return res.status(400).json({ message: messages.join(", ") });
    }

    res.status(500).json({ message: "Internal server error" });
  }
});

tasksRoutes.patch("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user as TokenPayload;
    const reqBody = req.body as Partial<CreateTaskInput>;

    if (!user?.userId) {
      return res.status(401).json({ message: "Invalid token payload" });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid task ID" });
    }

    const task = await Task.findOneAndUpdate(
      { _id: id, owner: user.userId },
      reqBody,
      {
        new: true,
        runValidators: true,
      },
    );

    if (!task) {
      return res
        .status(404)
        .json({ message: "Task not found or not authorized." });
    }

    res.status(200).json({ data: task });
  } catch (error: any) {
    console.error("Task update error:", error);

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map(
        (val: any) => val.message,
      );
      return res.status(400).json({ message: messages.join(", ") });
    }

    res.status(500).json({ message: "Internal server error" });
  }
});

tasksRoutes.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user as TokenPayload;

    if (!user?.userId) {
      return res.status(401).json({ message: "Invalid token payload" });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid task ID" });
    }

    const task = await Task.findOneAndDelete({ _id: id, owner: user.userId });

    if (!task) {
      return res
        .status(404)
        .json({ message: "Task not found or not authorized." });
    }

    res.status(200).json({ data: task });
  } catch (error: any) {
    console.error("Delete task error:", error);

    res.status(500).json({ message: "Internal server error" });
  }
});

export default tasksRoutes;
