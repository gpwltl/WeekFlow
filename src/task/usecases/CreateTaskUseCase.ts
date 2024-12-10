import { Task } from '../entities/Task'
import { TaskWriter } from '../repositories/TaskWriter'

export class CreateTaskUseCase {
  constructor(private taskWriter: TaskWriter) {}

  async execute(task: Omit<Task, 'id'>): Promise<Task> {
    return this.taskWriter.create(task)
  }
} 