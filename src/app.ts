import express from "express";

import authRoutes from "./routes/auth.routes";
import tasksRoutes from "./routes/task.routes";

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Welcome to chorely!" });
});

app.use("/api/auth", authRoutes);
app.use("/api/tasks", tasksRoutes);

export default app;
