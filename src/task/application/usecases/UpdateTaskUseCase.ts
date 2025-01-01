import { TaskData } from '../../domain/entities/Task';
import { TaskReadRepository } from '../../infrastructure/persistence/TaskReadRepository';
import { TaskWriteRepository } from '../../infrastructure/persistence/TaskWriteRepository';

export class UpdateTaskUseCase {
  constructor(
    private taskReadRepository: TaskReadRepository,
    private taskWriteRepository: TaskWriteRepository
  ) {}

  async execute(id: string, updateData: Partial<TaskData>): Promise<void> {
    const existingTask = await this.taskReadRepository.findById(id);
    if (!existingTask) {
      throw new Error(`Task not found with id: ${id}`);
    }

    const updatedTask = existingTask.update(updateData);
    await this.taskWriteRepository.updateTask(id, updatedTask);
  }
} 