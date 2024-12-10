import { Task } from '../entities/Task'
import { TaskRepository } from '../repositories/TaskRepository'

export class TaskUseCases {
  constructor(private taskRepository: TaskRepository) {}

  async getWeeklyTasks(startDate: Date, endDate: Date): Promise<Task[]> {
    return this.taskRepository.findByDateRange(startDate, endDate)
  }

  async createTask(task: Omit<Task, 'id'>): Promise<Task> {
    return this.taskRepository.create(task)
  }
} 