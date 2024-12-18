export interface TaskAnalytics {
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
  averageDuration: number;
  totalInterruptions: number;
  mostInterruptedTasks: Array<{
    taskId: string;
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

export interface TaskPrediction {
  date: string;
  predicted: number;
} 