export interface DomainEvent {
  readonly type: string;
  readonly occurredOn: Date;
  readonly aggregateId: string;
  readonly version: number;
}

export abstract class TaskDomainEvent implements DomainEvent {
  readonly occurredOn: Date = new Date();
  readonly version: number = 1;

  constructor(
    readonly aggregateId: string,
    readonly type: string
  ) {}
} 