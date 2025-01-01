import { GoogleGenerativeAI } from '@google/generative-ai';
import { FeedbackWriter } from '../../application/ports/FeedBackWriter';

export class GeminiFeedbackWriteRepository implements FeedbackWriter {
  private genAI: GoogleGenerativeAI;
  private model: any;
    
  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error('Gemini API 키가 필요합니다.');
    }
    
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-pro" });
  }

  async generateFeedback(taskName: string, status: string): Promise<string> {
    const prompt = `사용자가 "${taskName}" 작업을 "${status}" 했습니다. 긍정적이고 동기부여가 되는 짧은 피드백 메시지를 생성해주세요.`;
    
    console.log(`피드백 생성 시작 - 작업: ${taskName}, 상태: ${status}`);
    
    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const generatedMessage = response.text();
      
      console.log('피드백 생성 완료:', generatedMessage);
      
      return generatedMessage || '피드백을 생성할 수 없습니다.';
    } catch (error) {
      console.error('Gemini API 호출 중 에러 발생:', error);
      throw error;
    }
  }
} 