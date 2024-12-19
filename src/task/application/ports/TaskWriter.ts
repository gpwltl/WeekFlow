import { Task, TaskData } from "../../domain/entities/Task";

export interface TaskWriter {
  create(task: TaskData): Promise<Task>;
  update(id: string, task: Partial<TaskData>): Promise<Task>;
  delete(id: string): Promise<void>;
} 