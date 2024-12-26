export interface DomainEvent {
  readonly taskId: string;  
  readonly eventType: string;
  readonly description: string;
  readonly createdAt: Date;
}

export abstract class TaskDomainEvent implements DomainEvent {
  readonly taskId: string;
  readonly eventType: string;
  readonly description: string;
  readonly createdAt: Date;

  constructor(taskId: string, eventType: string, description: string, createdAt: Date) {
    this.taskId = taskId;
    this.eventType = eventType;
    this.description = description;
    this.createdAt = createdAt;
  }
}
