import { DomainEvent } from '../../domain/events/DomainEvent';
import { Result } from '@/shared/core/Result';

export interface IEventHandler<T extends DomainEvent> {
  handle(event: T): Promise<Result<void>>;
} 