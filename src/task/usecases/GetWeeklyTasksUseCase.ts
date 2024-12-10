import { Task } from "../entities/Task";
import { TaskReader } from "../repositories/TaskReader";
export class GetWeeklyTasksUseCase {
  constructor(private taskReader: TaskReader) {}

  async execute(startDate: Date, endDate: Date): Promise<Task[]> {
    return this.taskReader.findByDateRange(startDate, endDate)
  }
} 