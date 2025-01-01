import { Task } from '../../domain/entities/Task'
import { TaskStatusChangedEvent } from '../../domain/events/TaskEvents'
import { TaskReadRepository } from '../../infrastructure/persistence/TaskReadRepository'
import { TaskWriteRepository } from '../../infrastructure/persistence/TaskWriteRepository'
import { IEventPublisher } from '../ports/IEventPublisher'

export class UpdateTaskStatusUseCase {
  constructor(
    private taskRepository: TaskReadRepository, 
    private taskWriteRepository: TaskWriteRepository,
  ) {}

  async execute(taskId: string, newStatus: Task['status']): Promise<void> {
    const task = await this.taskRepository.findById(taskId)
    if (!task) {
      throw new Error('Task not found')
    }

    await this.taskWriteRepository.updateStatus(taskId, newStatus)
  }
}
