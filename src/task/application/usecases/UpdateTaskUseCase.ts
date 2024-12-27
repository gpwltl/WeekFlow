import { TaskData } from '../../domain/entities/Task';
import { TaskUpdatedEvent } from '../../domain/events/TaskEvents';
import { TaskReadRepository } from '../../infrastructure/persistence/TaskReadRepository';
import { TaskWriteRepository } from '../../infrastructure/persistence/TaskWriteRepository';
import { IEventPublisher } from '../ports/IEventPublisher';

export class UpdateTaskUseCase {
  constructor(
    private taskReadRepository: TaskReadRepository,
    private taskWriteRepository: TaskWriteRepository,
    private eventPublisher: IEventPublisher
  ) {}

  async execute(id: string, updateData: Partial<TaskData>): Promise<void> {
    const existingTask = await this.taskReadRepository.findById(id);
    if (!existingTask) {
      throw new Error(`Task not found with id: ${id}`);
    }

    const updatedTask = existingTask.update(updateData);
    await this.taskWriteRepository.update(id, updatedTask);
    await this.eventPublisher.publish(new TaskUpdatedEvent(id, 'Task updated', new Date()));
  }
} 