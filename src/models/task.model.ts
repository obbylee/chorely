import mongoose from "mongoose";

const taskModel = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please enter task title"],
      trim: true,
      maxlength: [100, "Title cannot be more than 100 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot be more than 500 characters"],
    },
    completed: {
      type: Boolean,
      default: false,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
  },
  { timestamps: true },
);

const Task = mongoose.model("Task", taskModel);

export default Task;
