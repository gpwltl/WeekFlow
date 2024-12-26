import { Task } from "../../domain/entities/Task";
import { TaskReadRepository } from "../../infrastructure/persistence/TaskReadRepository";

export class GetWeeklyTasksUseCase {
  constructor(private taskReader: TaskReadRepository) {}

  async execute(startDate: Date, endDate: Date): Promise<Task[]> {
    return this.taskReader.findByDateRange(startDate, endDate)
  }
} 