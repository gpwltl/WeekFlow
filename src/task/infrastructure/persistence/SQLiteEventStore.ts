import { IEventStore } from '../../application/ports/IEventStore';
import { DomainEvent } from '../../domain/events/DomainEvent';
import { Result } from '@/shared/core/Result';
import { db } from '@/shared/db';
import { taskEvents } from '@/shared/db/schema';
import { eq } from 'drizzle-orm';
import { LibSQLDatabase } from 'drizzle-orm/libsql';

export class SQLiteEventStore implements IEventStore {
  constructor(private db: LibSQLDatabase) {}

  async save(event: DomainEvent): Promise<Result<void>> {
    try {
      await db.insert(taskEvents).values({
        task_id: event.taskId,
        event_type: event.eventType,
        description: JSON.stringify({
          data: event
        }),
        created_at: event.createdAt.toISOString()
      });
      return Result.ok();
    } catch (error) {
      return Result.fail(`Failed to save event: ${error}`);
    }
  }

  async getByAggregateId(aggregateId: string): Promise<Result<DomainEvent[]>> {
    try {
      const events = await db
        .select()
        .from(taskEvents)
        .where(eq(taskEvents.task_id, aggregateId))
        .orderBy(taskEvents.created_at);

      return Result.ok(events.map(event => this.deserializeEvent(event)));
    } catch (error) {
      return Result.fail(`Failed to get events: ${error}`);
    }
  }

  async getByType(eventType: string): Promise<Result<DomainEvent[]>> {
    try {
      const events = await db
        .select()
        .from(taskEvents)
        .where(eq(taskEvents.event_type, eventType))
        .orderBy(taskEvents.created_at);

      return Result.ok(events.map(event => this.deserializeEvent(event)));
    } catch (error) {
      return Result.fail(`Failed to get events: ${error}`);
    }
  }

  private deserializeEvent(eventRecord: any): DomainEvent {
    const eventData = JSON.parse(eventRecord.description);
    return {
      ...eventData.data,
      occurredOn: new Date(eventData.occurredOn),
      version: eventData.version
    };
  }

  async saveEvents(events: any[]): Promise<void> {
    try {
      console.log('events', events)
      await db.insert(taskEvents).values(
        events.map(event => ({
          task_id: event.taskId,
          event_type: event.eventType,
          description: JSON.stringify(event),
          created_at: new Date().toISOString()
        }))
      );
    } catch (error) {
      console.error('Failed to save events:', error);
      throw error;
    }
  }

  async getEvents(aggregateId: string): Promise<any[]> {
    return [];
  }
} 