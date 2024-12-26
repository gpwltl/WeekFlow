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

  async execute(id: string, title: string): Promise<void> {
    const task = await this.taskReadRepository.findById(id);
    if (!task) {
      throw new Error('Task not found');
    }

    // 이벤트 발행
    await this.eventPublisher.publish(
      new TaskUpdatedEvent(task.id, 'Task updated', new Date())
    )

    task.title = title
    await this.taskWriteRepository.update(id, task)
  }
} 