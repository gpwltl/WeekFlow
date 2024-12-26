import { Task } from '../../domain/entities/Task'
import { TaskStatusChangedEvent } from '../../domain/events/TaskEvents'
import { TaskReadRepository } from '../../infrastructure/persistence/TaskReadRepository'
import { TaskWriteRepository } from '../../infrastructure/persistence/TaskWriteRepository'
import { IEventPublisher } from '../ports/IEventPublisher'

export class UpdateTaskStatusUseCase {
  constructor(
    private taskRepository: TaskReadRepository, 
    private taskWriteRepository: TaskWriteRepository,
    private eventPublisher: IEventPublisher
  ) {}

  async execute(taskId: string, newStatus: Task['status']): Promise<void> {
    // 기존 태스크 조회
    const task = await this.taskRepository.findById(taskId)
    if (!task) {
      throw new Error('Task not found')
    }

    // 상태 업데이트
    task.status = newStatus

    // 이벤트 발행
    await this.eventPublisher.publish(
      new TaskStatusChangedEvent(task.id, task.status, newStatus, 'Task status changed', new Date())
    )

    // 저장
    await this.taskWriteRepository.update(taskId, task)
  }
}
