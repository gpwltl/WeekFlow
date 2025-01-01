import { Feedback } from "../../domain/entities/FeedBack";
import { FeedbackWriter } from '../ports/FeedbackWriter';

export class GenerateFeedbackUseCase {
  constructor(private feedbackWriter: FeedbackWriter) {}

  async execute(taskId: string, taskName: string, status: 'in-progress' | 'completed'): Promise<Feedback> {
    return this.feedbackWriter.create({
      taskId,
      taskName,
      status,
      message: '',  // 메시지는 리포지토리에서 생성됨
      createdAt: new Date()
    });
  }
} 