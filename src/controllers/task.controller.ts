import mongoose from "mongoose";
import { type Request, type Response } from "express";

import Task from "../models/task.model";

import {
  createTaskService,
  getTaskByIdService,
  getUserTaskService,
  updateTaskService,
} from "../services/task.service";

import { type TokenPayload, type CreateTaskInput } from "../types";

export async function getCurrentUserTasks(req: Request, res: Response) {
  try {
    const user = req.user;

    if (!user?.userId) {
      return res.status(401).json({ message: "Invalid token payload" });
    }

    const tasks = await getUserTaskService(user.userId);
    res.status(200).json({ data: tasks });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function getTaskById(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const isValidId = mongoose.Types.ObjectId.isValid(id);

    if (!isValidId) {
      return res.status(400).json({ message: "Invalid task ID" });
    }

    const task = await getTaskByIdService(id);

    if (!task) {
      return res.json({ message: "Task not found." });
    }

    res.status(200).json({ data: task });
  } catch (error: any) {
    console.log(error);

    res.status(500).json({ message: "Internal server error" });
  }
}

export async function createTask(req: Request, res: Response) {
  try {
    const reqBody = req.body as CreateTaskInput;
    const user = req.user as TokenPayload;

    if (!user?.userId) {
      return res.status(401).json({ message: "Invalid token payload" });
    }

    const task = await createTaskService(reqBody, user.userId);

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
}

export async function patchTask(req: Request, res: Response) {
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

    if (!reqBody || Object.keys(reqBody).length === 0) {
      return res.status(400).json({ message: "Request body cannot be empty." });
    }

    const allowedUpdates = ["title", "description", "status"];
    const updates = Object.keys(reqBody);
    const isValidOperation = updates.every((update) =>
      allowedUpdates.includes(update),
    );

    if (!isValidOperation) {
      return res.status(400).json({ message: "Invalid updates!" });
    }

    const task = await updateTaskService(id, user.userId, reqBody);

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
}

export async function deleteTask(req: Request, res: Response) {
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

    res.status(200).json({ message: "Task deleted successfully", data: task });
  } catch (error: any) {
    console.error("Delete task error:", error);

    res.status(500).json({ message: "Internal server error" });
  }
}
