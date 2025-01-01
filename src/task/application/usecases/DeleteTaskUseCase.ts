import { TaskDeletedEvent } from '../../domain/events/TaskEvents';
import { TaskReadRepository } from '../../infrastructure/persistence/TaskReadRepository';
import { TaskWriteRepository } from '../../infrastructure/persistence/TaskWriteRepository';
import { IEventPublisher } from '../ports/IEventPublisher';

export class DeleteTaskUseCase {
  constructor(
    private taskReadRepository: TaskReadRepository, 
    private taskWriteRepository: TaskWriteRepository,
  ) {}

  async execute(id: string): Promise<void> {
    const task = await this.taskReadRepository.findById(id);
    if (!task) {
      throw new Error('Task not found');
    }

    await this.taskWriteRepository.delete(id);
  }
} 