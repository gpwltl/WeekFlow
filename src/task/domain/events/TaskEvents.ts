import { TaskDomainEvent } from './DomainEvent';
import { TaskStatus } from '../entities/Task';

export class TaskCreatedEvent extends TaskDomainEvent {
  constructor(
    aggregateId: string,
    description: string,
    createdAt: Date
  ) {
    super(aggregateId, 'TaskCreated', description, createdAt);
  }
}

export class TaskStatusChangedEvent extends TaskDomainEvent {
  constructor(
    aggregateId: string,
    readonly oldStatus: TaskStatus,
    readonly newStatus: TaskStatus,
    readonly description: string,
    readonly createdAt: Date
  ) {
    super(aggregateId, 'TaskStatusChanged', description, createdAt);
  }
}

export class TaskUpdatedEvent extends TaskDomainEvent {
  constructor(aggregateId: string, description: string, createdAt: Date) {
    super(aggregateId, 'TaskUpdated', description, createdAt);
  }
}

export class TaskCompletedEvent extends TaskDomainEvent {
  constructor(
    aggregateId: string,
    readonly completedAt: Date,
    readonly duration: number,
    readonly description: string,
    readonly createdAt: Date
  ) {
    super(aggregateId, 'TaskCompleted', description, createdAt);
  }
}

export class TaskDeletedEvent extends TaskDomainEvent {
  constructor(aggregateId: string, description: string, createdAt: Date) {
    super(aggregateId, 'TaskDeleted', description, createdAt);
  }
}