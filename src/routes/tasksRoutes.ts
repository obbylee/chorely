import { Router } from "express";
import Task from "../models/task.model";
import mongoose from "mongoose";

const tasksRoutes = Router();

tasksRoutes.get("/", async (req, res) => {
  try {
    const tasks = await Task.find({});
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

tasksRoutes.post("/", async (req, res) => {
  try {
    const reqBody = req.body;

    const task = await Task.create(reqBody);

    res.status(201).json({ data: task });
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

tasksRoutes.patch("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const reqBody = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid task ID" });
    }

    const task = await Task.findByIdAndUpdate(id, reqBody, {
      new: true,
      runValidators: true,
    });

    if (!task) {
      return res.status(404).json({ message: "Task not found." });
    }

    res.status(200).json({ data: task });
  } catch (error: any) {
    console.log(error);

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map(
        (val: any) => val.message,
      );
      return res.status(400).json({ message: messages.join(", ") });
    }

    res.status(500).json({ message: "Internal server error" });
  }
});

tasksRoutes.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid task ID" });
    }

    const task = await Task.findByIdAndDelete(id);

    if (!task) {
      return res.status(404).json({ message: "Task not found." });
    }

    res.status(200).json({ data: task });
  } catch (error: any) {
    console.log(error);

    res.status(500).json({ message: "Internal server error" });
  }
});

export default tasksRoutes;
