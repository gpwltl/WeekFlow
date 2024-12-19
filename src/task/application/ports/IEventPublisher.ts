import { DomainEvent } from '../../domain/events/DomainEvent';
import { Result } from '@/shared/core/Result';

export interface IEventPublisher {
  publish(event: DomainEvent): Promise<Result<void>>;
  publishAll(events: DomainEvent[]): Promise<Result<void>>;
} 