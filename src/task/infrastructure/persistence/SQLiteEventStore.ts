import { Injectable } from '@nestjs/common';
import { IEventStore } from '../../application/ports/IEventStore';
import { DomainEvent } from '../../domain/events/DomainEvent';
import { Result } from '@/shared/core/Result';
import { db } from '@/shared/db';
import { taskEvents } from '@/shared/db/schema';
import { eq } from 'drizzle-orm';

export class SQLiteEventStore implements IEventStore {
  async save(event: DomainEvent): Promise<Result<void>> {
    try {
      await db.insert(taskEvents).values({
        task_id: event.aggregateId,
        event_type: event.type,
        description: JSON.stringify({
          version: event.version,
          occurredOn: event.occurredOn,
          data: event
        }),
        created_at: event.occurredOn.toISOString()
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
} 