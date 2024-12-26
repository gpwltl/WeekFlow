import { DomainEvent } from '../../domain/events/DomainEvent';

export interface IEventPublisher {
  publish(event: DomainEvent): Promise<void>;
  publishEvents(events: any[]): Promise<void>;
} 