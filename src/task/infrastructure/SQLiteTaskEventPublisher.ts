import { TaskEventPublisher } from '../repositories/TaskEventPublisher';
import { db } from '@/shared/db';
import { taskEvents } from '@/shared/db/schema';

export class SQLiteTaskEventPublisher implements TaskEventPublisher {
  async publish(event: {
    type: string;
    taskId: string;
    oldStatus?: string;
    newStatus?: string;
  }): Promise<void> {
    await db.insert(taskEvents).values({
      task_id: event.taskId,
      event_type: event.type,
      description: `Status changed from ${event.oldStatus} to ${event.newStatus}`
    });
  }
} 