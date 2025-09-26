import Task from "../models/task.model";
import { CreateTaskInput } from "../types";

export async function getUserTaskService(userId: string) {
  const tasks = await Task.find({ owner: userId });
  return tasks;
}

export async function getTaskByIdService(id: string) {
  const task = await Task.findById(id);
  return task;
}

export async function createTaskService(
  taskData: CreateTaskInput,
  ownerId: string,
) {
  const task = await Task.create({ ...taskData, owner: ownerId });
  return task;
}

export async function updateTaskService(
  taskId: string,
  ownerId: string,
  taskData: Partial<CreateTaskInput>,
) {
  const task = await Task.findByIdAndUpdate(
    { _id: taskId, owner: ownerId },
    { ...taskData },
    {
      new: true,
      runValidators: true,
    },
  );
  return task;
}

export async function deleteTaskService(taskId: string, ownerId: string) {
  const task = await Task.findByIdAndDelete({ _id: taskId, owner: ownerId });
  return task;
}
