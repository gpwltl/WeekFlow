import { Task } from "../entities/Task";

export interface TaskReader {
  findById(id: string): Promise<Task | null>;
  findAll(): Promise<Task[]>;
  findByDateRange(startDate: Date, endDate: Date): Promise<Task[]>;
} 