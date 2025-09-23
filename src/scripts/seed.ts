import * as dotenv from "dotenv";
import mongoose from "mongoose";
import argon2 from "argon2";

import Task from "../models/task.model";
import User from "../models/user.model";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || "your_mongodb_url";

const seedDatabase = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB for seeding.");

    // Clear existing data to prevent duplicates
    await User.deleteMany({});
    await Task.deleteMany({});
    console.log("Old data cleared.");

    const hashedPassword = await argon2.hash("888888");

    // Prepare user data with hashed passwords
    const usersData = [
      {
        username: "john.doe",
        email: "john.doe@example.com",
        passwordHashed: hashedPassword,
      },
      {
        username: "jane.smith",
        email: "jane.smith@example.com",
        passwordHashed: hashedPassword,
      },
    ];

    const users = await User.insertMany(usersData);

    console.log("users seeded!");

    // Create tasks associated with the created users
    const tasksData = [
      {
        title: "Buy groceries",
        description: "Milk, eggs, and bread.",
        completed: false,
        owner: users[0]._id, // John's task
      },
      {
        title: "Finish Node.js project",
        description: "Complete the authentication module.",
        completed: true,
        owner: users[0]._id, // John's task
      },
      {
        title: "Call a friend",
        description: "Schedule a dinner date.",
        completed: false,
        owner: users[1]._id, // Jane's task
      },
    ];

    await Task.insertMany(tasksData);
    console.log("tasks seeded!");

    console.log("Database seeded successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    mongoose.disconnect();
  }
};

seedDatabase();
