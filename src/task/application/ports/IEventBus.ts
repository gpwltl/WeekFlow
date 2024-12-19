import { DomainEvent } from '../../domain/events/DomainEvent';
import { Result } from '@/shared/core/Result';

export interface IEventBus {
  publish<T extends DomainEvent>(event: T): Promise<Result<void>>;
  subscribe<T extends DomainEvent>(
    eventType: string, 
    handler: (event: T) => Promise<Result<void>>
  ): void;
} 