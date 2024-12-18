export interface DomainEvent {
  type: string;
  taskId: string;
  description?: string;
} 