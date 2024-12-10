import { Task } from "../entities/Task"

export interface TaskWriter {
  create(task: Omit<Task, 'id'>): Promise<Task>
  update(id: string, task: Partial<Task>): Promise<Task>
  delete(id: string): Promise<void>
} 