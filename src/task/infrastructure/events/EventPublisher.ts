import { IEventPublisher } from '../../application/ports/IEventPublisher';
import { DomainEvent } from '../../domain/events/DomainEvent';
import { Result } from '@/shared/core/Result';
import { EventBus } from './EventBus';

export class EventPublisher implements IEventPublisher {
  constructor(private eventBus: EventBus) {}

  async publish(event: DomainEvent): Promise<Result<void>> {
    return this.eventBus.publish(event);
  }

  async publishAll(events: DomainEvent[]): Promise<Result<void>> {
    if (!events || events.length === 0) {
      console.warn('No events to publish');
      return Result.ok();
    }

    for (const event of events) {
      console.log(`Publishing event: ${event.constructor.name}`, event);
      const result = await this.publish(event);
      if (!result.isSuccess) {
        return Result.fail(result.error || 'Unknown error');
      }
    }
    return Result.ok();
  }
} 