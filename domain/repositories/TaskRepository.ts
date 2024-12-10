import { Task } from '../entities/Task'

export interface TaskRepository {
  findAll(): Promise<Task[]>
  findByDateRange(startDate: Date, endDate: Date): Promise<Task[]>
  create(task: Omit<Task, 'id'>): Promise<Task>
  update(id: string, task: Partial<Task>): Promise<Task>
  delete(id: string): Promise<void>
} 