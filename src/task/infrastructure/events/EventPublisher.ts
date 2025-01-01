import { IEventPublisher } from '../../application/ports/IEventPublisher';
import { DomainEvent } from '../../domain/events/DomainEvent';
import { EventBus } from './EventBus';

export class EventPublisher implements IEventPublisher {
  constructor(private eventBus: EventBus) {}

  async publish(event: DomainEvent): Promise<void> {
    await this.eventBus.publish(event);
  }

  async publishEvents(events: any[]): Promise<void> {
    for (const event of events) {
      await this.publish(event);
    }
  }
} 