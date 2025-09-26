import * as dotenv from "dotenv";
import express from "express";

import authRoutes from "./routes/auth.routes";
import tasksRoutes from "./routes/task.routes";

import mongoose from "mongoose";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Welcome to chorely!" });
});

app.use("/api/auth", authRoutes);
app.use("/api/tasks", tasksRoutes);

mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/chorely-db")
  .then(() => {
    console.log("Connected to MongoDB!");

    // Start the server after a successful database connection
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });
