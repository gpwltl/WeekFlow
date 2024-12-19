import { DomainEvent } from '../../domain/events/DomainEvent';
import { Result } from '@/shared/core/Result';

export interface IEventReplayer {
  replayEvents(aggregateId: string): Promise<Result<void>>;
  replayEventsByType(eventType: string): Promise<Result<void>>;
} 