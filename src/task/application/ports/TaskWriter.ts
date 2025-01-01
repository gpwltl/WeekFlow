import { Task, TaskData, TaskStatus } from "../../domain/entities/Task";

export interface TaskWriter {
  create(task: TaskData): Promise<Task>;
  updateTask(id: string, task: Partial<TaskData>): Promise<void>;
  updateStatus(id: string, newStatus: TaskStatus): Promise<void>;
  delete(id: string): Promise<void>;
} 