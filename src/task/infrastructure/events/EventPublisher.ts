import { IEventPublisher } from '../../application/ports/IEventPublisher';
import { DomainEvent } from '../../domain/events/DomainEvent';
import { Result } from '@/shared/core/Result';
import { EventBus } from './EventBus';

export class EventPublisher implements IEventPublisher {
  constructor(private eventBus: EventBus) {}

  async publish(event: DomainEvent): Promise<void> {
    const result = await this.eventBus.publish(event);
    if (!result.isSuccess) {
      throw new Error(result.error || 'Unknown error');
    }
  }

  async publishAll(events: DomainEvent[]): Promise<Result<void>> {
    if (!events || events.length === 0) {
      console.warn('No events to publish');
      return Result.ok();
    }

    for (const event of events) {
      console.log(`Publishing event: ${event.constructor.name}`, event);
      await this.publish(event);
    }
    return Result.ok();
  }

  async publishEvents(events: any[]): Promise<void> {
    for (const event of events) {
      await this.publish(event);
    }
  }
} 