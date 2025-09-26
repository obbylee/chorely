import * as dotenv from "dotenv";
import mongoose from "mongoose";
import app from "./app";

dotenv.config();

const port = process.env.PORT || 3000;

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
