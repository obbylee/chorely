import { Router } from "express";

const tasksRoutes = Router();

tasksRoutes.get("/", (req, res) => {
  res.json({ message: "All tasks" });
});

export default tasksRoutes;
