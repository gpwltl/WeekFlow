import { Injectable } from '@nestjs/common';
import { Result } from '@/shared/core/Result';
import { DomainEvent } from '@/src/task/domain/events/DomainEvent';
import { db } from '@/shared/db';
import { IEventPublisher } from '../../application/ports/IEventPublisher';
import { taskEvents } from '@/shared/db/schema';
@Injectable()
export class TaskEventPublisher implements IEventPublisher {
  async publish(event: DomainEvent): Promise<Result<void>> {
    try {
      await db.insert(taskEvents).values({
        task_id: event.taskId,
        event_type: event.type,
        description: event.description
      });
      return Result.ok();
    } catch (error) {
      return Result.fail(error as string);
    }
  }
} 