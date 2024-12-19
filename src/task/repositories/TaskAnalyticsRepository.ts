import { Injectable } from '@nestjs/common';
import { TaskAnalyticsReader } from './TaskAnalyticsReader';
import { db } from '@/shared/db';
import { tasks, taskEvents } from '@/shared/db/schema';
import { eq, and, between, count, sql } from 'drizzle-orm';
import { TaskAnalytics } from '../domain/entities/TaskAnalytics';

@Injectable()
export class TaskAnalyticsRepository implements TaskAnalyticsReader {
  // 작업 완료율 계산
  async getCompletionRate(startDate: Date, endDate: Date): Promise<number> {
    const result = await db
      .select({
        total: sql<number>`count(*)`,
        completed: sql<number>`count(case when ${tasks.status} = 'completed' then 1 end)`
      })
      .from(tasks)
      .where(
        and(
          between(tasks.start_date, startDate.toISOString(), endDate.toISOString())
        )
      );
    
    const { total, completed } = result[0];
    return total > 0 ? (completed / total) * 100 : 0;
  }

  // 평균 작업 시간 계산
  async getAverageDuration(startDate: Date, endDate: Date): Promise<number> {
    const result = await db
      .select({
        avgDuration: sql<number>`avg(${tasks.actual_duration})`
      })
      .from(tasks)
      .where(
        and(
          between(tasks.start_date, startDate.toISOString(), endDate.toISOString()),
          eq(tasks.status, 'completed')
        )
      );

    return result[0].avgDuration || 0;
  }

  // 작업 중단 분석
  async getInterruptionAnalytics(startDate: Date, endDate: Date): Promise<TaskAnalytics> {
    const interruptionsQuery = await db
      .select({
        taskId: tasks.id,
        taskName: tasks.title,
        interruptions: tasks.interruption_count,
      })
      .from(tasks)
      .where(
        and(
          between(tasks.start_date, startDate.toISOString(), endDate.toISOString())
        )
      )
      .orderBy(tasks.interruption_count)
      .limit(5);

    const totalStats = await db
      .select({
        totalTasks: sql<number>`count(*)`,
        completedTasks: sql<number>`count(case when ${tasks.status} = 'completed' then 1 end)`,
        totalInterruptions: sql<number>`sum(${tasks.interruption_count})`
      })
      .from(tasks)
      .where(
        between(tasks.start_date, startDate.toISOString(), endDate.toISOString())
      );

    const stats = totalStats[0];

    return {
      totalTasks: stats.totalTasks || 0,
      completedTasks: stats.completedTasks || 0,
      completionRate: stats.totalTasks > 0 ? (stats.completedTasks / stats.totalTasks) * 100 : 0,
      averageDuration: await this.getAverageDuration(startDate, endDate),
      totalInterruptions: stats.totalInterruptions || 0,
      mostInterruptedTasks: interruptionsQuery.map(task => ({
        taskId: task.taskId.toString(),
        taskName: task.taskName as unknown as string,
        interruptions: task.interruptions || 0
      }))
    };
  }

  // 작업 예측
  async getPredictedTasks(startDate: Date, endDate: Date): Promise<any> {
    // 간단한 통계 기반 예측 구현
    const historicalData = await db
      .select({
        date: tasks.start_date,
        count: sql<number>`count(*)`
      })
      .from(tasks)
      .groupBy(tasks.start_date)
      .orderBy(tasks.start_date);

    // 이동 평균을 사용한 기본 예측
    const movingAverage = 7;
    const predictions = historicalData.map((data, index, array) => {
      if (index < movingAverage) return null;
      
      const sum = array
        .slice(index - movingAverage, index)
        .reduce((acc, curr) => acc + curr.count, 0);
      
      return {
        date: data.date,
        predicted: sum / movingAverage
      };
    }).filter(Boolean);

    return predictions;
  }
} 