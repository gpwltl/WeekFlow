export interface TaskEventPublisher {
  publish(event: {
    type: string;
    taskId: string;
    oldStatus?: string;
    newStatus?: string;
  }): Promise<void>;
} 