import { GoogleGenerativeAI } from '@google/generative-ai';
import { FeedbackData } from "../../domain/entities/FeedBack";
import { Feedback } from "../../domain/entities/FeedBack";
import { FeedbackWriter } from '../../application/ports/FeedbackWriter';

export class GeminiFeedbackWriteRepository implements FeedbackWriter {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
  }

  async create(data: FeedbackData): Promise<Feedback> {
    try {
      const prompt = this.generatePrompt(data.taskName, data.status);
      const result = await this.model.generateContent(prompt);
      const message = result.response.text();

      return Feedback.create({
        ...data,
        message,
        createdAt: new Date()
      });
    } catch (error) {
      console.error('Feedback generation failed:', error);
      throw error;
    }
  }

  private generatePrompt(taskName: string, status: string): string {
    return `
      작업 "${taskName}"의 상태가 "${status}"로 변경되었습니다.
      이에 대한 짧고 긍정적인 피드백 메시지를 생성해주세요.
      메시지는 한 문장으로, 격려하는 톤으로 작성해주세요.
    `;
  }
} 