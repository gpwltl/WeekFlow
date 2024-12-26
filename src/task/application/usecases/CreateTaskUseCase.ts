import { Task, TaskData } from '../../domain/entities/Task'
import { IEventPublisher } from '../ports/IEventPublisher'
import { Result } from '@/shared/core/Result'
import { randomUUID } from 'crypto';
import { TaskCreatedEvent } from '../../domain/events/TaskEvents'
import { TaskWriteRepository } from '../../infrastructure/persistence/TaskWriteRepository'

export class CreateTaskUseCase {
  constructor(
    private taskRepository: TaskWriteRepository,
    private eventPublisher: IEventPublisher
  ) {}

  async execute(taskData: TaskData): Promise<Result<Task>> {
    const task = Task.create({ 
      ...taskData,
      id: randomUUID()
    });
    
    // 태스크 저장
    await this.taskRepository.create(task)
    
    // 이벤트 발행
    await this.eventPublisher.publish(
      new TaskCreatedEvent(task.id,
      'Task created',
      new Date()
      )
    )

    return Result.ok(task)
  }
} 