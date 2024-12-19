import { TaskDomainEvent } from './DomainEvent';
import { TaskStatus } from '../entities/Task';

export class TaskCreatedEvent extends TaskDomainEvent {
  constructor(
    aggregateId: string,
    readonly taskData: {
      title: string;
      content: string;
      startDate: string;
      endDate: string;
      author: string;
    }
  ) {
    super(aggregateId, 'TaskCreated');
  }
}

export class TaskStatusChangedEvent extends TaskDomainEvent {
  constructor(
    aggregateId: string,
    readonly oldStatus: TaskStatus,
    readonly newStatus: TaskStatus
  ) {
    super(aggregateId, 'TaskStatusChanged');
  }
}

export class TaskCompletedEvent extends TaskDomainEvent {
  constructor(
    aggregateId: string,
    readonly completedAt: Date,
    readonly duration: number
  ) {
    super(aggregateId, 'TaskCompleted');
  }
} 