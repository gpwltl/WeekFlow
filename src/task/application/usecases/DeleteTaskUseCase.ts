import { TaskDeletedEvent } from '../../domain/events/TaskEvents';
import { TaskReadRepository } from '../../infrastructure/persistence/TaskReadRepository';
import { TaskWriteRepository } from '../../infrastructure/persistence/TaskWriteRepository';
import { IEventPublisher } from '../ports/IEventPublisher';

export class DeleteTaskUseCase {
  constructor(
    private taskReadRepository: TaskReadRepository, 
    private taskWriteRepository: TaskWriteRepository,
    private eventPublisher: IEventPublisher
) {}

  async execute(id: string): Promise<void> {
    const task = await this.taskReadRepository.findById(id);
    if (!task) {
      throw new Error('Task not found');
    }

    // 이벤트 발행
    await this.eventPublisher.publish(
      new TaskDeletedEvent(task.id, 'Task deleted', new Date())
    )

    await this.taskWriteRepository.delete(id);
  }
} 