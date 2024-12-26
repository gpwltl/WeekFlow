import { DomainEvent } from '../../domain/events/DomainEvent';
import { Result } from '@/shared/core/Result';

export interface IEventStore {
  save(event: DomainEvent): Promise<Result<void>>;
  getByAggregateId(aggregateId: string): Promise<Result<DomainEvent[]>>;
  getByType(eventType: string): Promise<Result<DomainEvent[]>>;
  saveEvents(events: any[]): Promise<void>;
  getEvents(aggregateId: string): Promise<any[]>;
} 