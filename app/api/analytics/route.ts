import { db } from '@/shared/db';
import { tasks } from '@/shared/db/schema';
import { and, between, sql } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate') || new Date().toISOString();
    const endDate = searchParams.get('endDate') || new Date().toISOString();

    const [taskStats, interruptionData, predictions] = await Promise.all([
      // 작업 통계
      db.select({
        totalTasks: sql<number>`count(*)`,
        completedTasks: sql<number>`count(case when status = 'completed' then 1 end)`,
        averageDuration: sql<number>`avg(actual_duration)`,
        totalInterruptions: sql<number>`sum(interruption_count)`
      })
      .from(tasks)
      .where(
        and(
          between(tasks.start_date, startDate, endDate)
        )
      ),

      // 중단 분석
      db.select({
        taskId: tasks.id,
        taskName: tasks.title,
        interruptions: tasks.interruption_count,
      })
      .from(tasks)
      .where(
        and(
          between(tasks.start_date, startDate, endDate)
        )
      )
      .orderBy(tasks.interruption_count)
      .limit(5),

      // 작업 예측 (간단한 통계 기반)
      db.select({
        date: tasks.start_date,
        count: sql<number>`count(*)`
      })
      .from(tasks)
      .groupBy(tasks.start_date)
      .orderBy(tasks.start_date)
    ]);

    const stats = taskStats[0];
    const completionRate = stats.totalTasks > 0 
      ? (stats.completedTasks / stats.totalTasks) * 100 
      : 0;

    // 이동 평균을 사용한 예측 계산
    const movingAverage = 7;
    const predictionsData = predictions.map((data, index, array) => {
      if (index < movingAverage) return null;
      const sum = array
        .slice(index - movingAverage, index)
        .reduce((acc, curr) => acc + Number(curr.count), 0);
      
      return {
        date: data.date,
        predicted: sum / movingAverage
      };
    }).filter(Boolean);

    return NextResponse.json({
      analytics: {
        totalTasks: stats.totalTasks || 0,
        completedTasks: stats.completedTasks || 0,
        completionRate,
        averageDuration: stats.averageDuration || 0,
        totalInterruptions: stats.totalInterruptions || 0,
        mostInterruptedTasks: interruptionData.map(task => ({
          taskId: task.taskId,
          taskName: task.taskName,
          interruptions: task.interruptions || 0
        }))
      },
      predictions: predictionsData
    });
  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    );
  }
} 