import { Injectable } from '@nestjs/common';
import { IEventReplayer } from '../../application/ports/IEventReplayer';
import { IEventStore } from '../../application/ports/IEventStore';
import { IEventBus } from '../../application/ports/IEventBus';
import { Result } from '@/shared/core/Result';

export class EventReplayer implements IEventReplayer {
  constructor(
    private eventStore: IEventStore,
    private eventBus: IEventBus
  ) {}

  async replayEvents(aggregateId: string): Promise<Result<void>> {
    const eventsResult = await this.eventStore.getByAggregateId(aggregateId);
    if (!eventsResult.isSuccess) {
      return Result.fail(eventsResult.error || 'Unknown error');
    }

    for (const event of eventsResult.getValue()) {
      const result = await this.eventBus.publish(event);
      if (!result.isSuccess) {
        return Result.fail(`Failed to replay event: ${result.error || 'Unknown error'}`);
      }
    }

    return Result.ok();
  }

  async replayEventsByType(eventType: string): Promise<Result<void>> {
    const eventsResult = await this.eventStore.getByType(eventType);
    if (!eventsResult.isSuccess) {
      return Result.fail(eventsResult.error || 'Unknown error');
    }

    for (const event of eventsResult.getValue()) {
      const result = await this.eventBus.publish(event);
      if (!result.isSuccess) {
        return Result.fail(`Failed to replay event: ${result.error || 'Unknown error'}`);
      }
    }

    return Result.ok();
  }
} 