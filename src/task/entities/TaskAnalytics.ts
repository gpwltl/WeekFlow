export interface TaskAnalytics {
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
  averageDuration: number;
  totalInterruptions: number;
  mostInterruptedTasks: Array<{
    taskId: number;
    taskName: string;
    interruptions: number;
  }>;
}

export interface TaskEvent {
  id: number;
  taskId: number;
  eventType: 'START' | 'PAUSE' | 'RESUME' | 'COMPLETE';
  createdAt: Date;
  description?: string;
} 