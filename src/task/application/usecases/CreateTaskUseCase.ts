import { Task, TaskData } from '../../domain/entities/Task'
import { IEventPublisher } from '../ports/IEventPublisher'
import { Result } from '@/shared/core/Result'
import { randomUUID } from 'crypto';
import { TaskWriteRepository } from '../../infrastructure/persistence/TaskWriteRepository'

export class CreateTaskUseCase {
  constructor(
    private taskRepository: TaskWriteRepository,
  ) {}

  async execute(taskData: TaskData): Promise<Result<Task>> {
    // Task 생성 (이벤트는 도메인 엔티티 내부에서 생성됨)
    const task = Task.create({ 
      ...taskData,
      id: randomUUID()
    });
    
    // Repository에서 저장과 이벤트 처리를 함께 수행
    await this.taskRepository.create(task)

    return Result.ok(task)
  }
} 