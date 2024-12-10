import { Task } from "../entities/Task";

export interface TaskReader {
  findAll(): Promise<Task[]>
  findByDateRange(startDate: Date, endDate: Date): Promise<Task[]>
} 