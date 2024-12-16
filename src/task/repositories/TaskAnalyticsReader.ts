import { TaskAnalytics } from '../entities/TaskAnalytics';

export interface TaskAnalyticsReader {
  getCompletionRate(startDate: Date, endDate: Date): Promise<number>;
  getAverageDuration(startDate: Date, endDate: Date): Promise<number>;
  getInterruptionAnalytics(startDate: Date, endDate: Date): Promise<TaskAnalytics>;
  getPredictedTasks(startDate: Date, endDate: Date): Promise<any>;
} 