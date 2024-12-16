import { Injectable } from '@nestjs/common';
import { TaskAnalyticsReader } from '../repositories/TaskAnalyticsReader';
import { TaskAnalytics } from '../entities/TaskAnalytics';

interface DateRange {
  startDate: Date;
  endDate: Date;
}

interface AnalyticsResult extends TaskAnalytics {
  dateRange: DateRange;
  predictions: any[];
}

@Injectable()
export class AnalyzeTasksUseCase {
  constructor(
    private readonly analyticsReader: TaskAnalyticsReader
  ) {}

  /**
   * 작업 분석을 수행하고 결과를 반환합니다.
   * @param startDate 분석 시작 날짜
   * @param endDate 분석 종료 날짜
   */
  async analyze(startDate: Date, endDate: Date): Promise<AnalyticsResult> {
    try {
      const [analytics, predictions] = await Promise.all([
        this.getAnalytics(startDate, endDate),
        this.analyticsReader.getPredictedTasks(startDate, endDate)
      ]);

      return {
        ...analytics,
        dateRange: { startDate, endDate },
        predictions
      };
    } catch (error) {
      console.error('작업 분석 중 오류 발생:', error);
      throw new Error('작업 분석을 수행할 수 없습니다.');
    }
  }

  /**
   * 상세 분석 데이터를 수집합니다.
   */
  private async getAnalytics(startDate: Date, endDate: Date): Promise<TaskAnalytics> {
    const [completionRate, averageDuration, interruptions] = await Promise.all([
      this.analyticsReader.getCompletionRate(startDate, endDate),
      this.analyticsReader.getAverageDuration(startDate, endDate),
      this.analyticsReader.getInterruptionAnalytics(startDate, endDate)
    ]);

    return {
      ...interruptions,
      completionRate,
      averageDuration
    };
  }

  /**
   * 특정 기간의 작업 예측을 수행합니다.
   */
  async predictTasks(startDate: Date, endDate: Date): Promise<any> {
    try {
      return await this.analyticsReader.getPredictedTasks(startDate, endDate);
    } catch (error) {
      console.error('작업 예측 중 오류 발생:', error);
      throw new Error('작업 예측을 수행할 수 없습니다.');
    }
  }
} 