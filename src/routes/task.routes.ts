import { Router } from "express";

import { authMiddleware } from "../middlewares/authMiddleware";

import {
  createTask,
  deleteTask,
  getCurrentUserTasks,
  getTaskById,
  patchTask,
} from "../controllers/task.controller";

const tasksRoutes = Router();

tasksRoutes.get("/", authMiddleware, getCurrentUserTasks);

tasksRoutes.get("/:id", getTaskById);

tasksRoutes.post("/", authMiddleware, createTask);

tasksRoutes.patch("/:id", authMiddleware, patchTask);

tasksRoutes.delete("/:id", authMiddleware, deleteTask);

export default tasksRoutes;
