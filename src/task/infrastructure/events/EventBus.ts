import { DomainEvent } from '../../domain/events/DomainEvent';
import { IEventStore } from '../../application/ports/IEventStore';
import { Result } from '@/shared/core/Result';
import { IEventPublisher } from '../../application/ports/IEventPublisher';

export class EventBus implements IEventPublisher {
  private handlers: Map<string, Array<(event: DomainEvent) => Promise<Result<void>>>> = new Map();

  constructor(private eventStore: IEventStore) {}

  async publish(event: DomainEvent): Promise<void> {
    try {
      // 이벤트 저장
      await this.eventStore.save(event);
    } catch (error) {
      console.error('Failed to publish event:', error);
    }
  } 

  async publishEvents(events: DomainEvent[]): Promise<void> {
    for (const event of events) {
      await this.publish(event);
    }
  }

} 