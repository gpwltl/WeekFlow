import { Injectable } from '@nestjs/common';
import { IEventPublisher } from '../../application/ports/IEventPublisher';
import { IEventStore } from '../../application/ports/IEventStore';
import { DomainEvent } from '../../domain/events/DomainEvent';
import { Result } from '@/shared/core/Result';

export class EventPublisher implements IEventPublisher {
  constructor(private eventStore: IEventStore) {}

  async publish(event: DomainEvent): Promise<Result<void>> {
    return this.eventStore.save(event);
  }

  async publishAll(events: DomainEvent[]): Promise<Result<void>> {
    try {
      for (const event of events) {
        const result = await this.publish(event);
        if (!result.isSuccess) {
          return Result.fail(result.error || 'Unknown error');
        }
      }
      return Result.ok();
    } catch (error) {
      return Result.fail(`Failed to publish events: ${error}`);
    }
  }
} 