import { Task, TaskData } from '../../domain/entities/Task'
import { Injectable } from '@nestjs/common'
import { IEventPublisher } from '../ports/IEventPublisher'
import { Result } from '@/shared/core/Result'
import { randomUUID } from 'crypto';
import { TaskCreatedEvent } from '../../domain/events/TaskEvents'
import { SQLiteTaskRepository } from '../../repositories/SQLiteTaskRepository'

export class CreateTaskUseCase {
  constructor(
    private taskRepository: SQLiteTaskRepository,
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
      new TaskCreatedEvent(task.id, {
        title: task.title,
        content: task.content,
        startDate: task.start_date,
        endDate: task.end_date,
        author: task.author
      })
    )

    return Result.ok(task)
  }
} 