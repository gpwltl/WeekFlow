import { OpenAI } from 'openai';
import { FeedbackWriter } from '../../application/ports/FeedbackWriter';
import { FeedbackData } from '../../domain/entities/FeedBack';
import { Feedback } from '../../domain/entities/FeedBack';

export class FeedBackWriteRepository implements FeedbackWriter {
  private openai: OpenAI;
    
  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error('OpenAI API 키가 필요합니다.');
    }
    
    this.openai = new OpenAI({
      apiKey: apiKey,
    });
  }

  async create(data: FeedbackData): Promise<Feedback> {
    const prompt = `사용자가 "${data.taskName}" 작업을 "${data.status}" 했습니다. 긍정적이고 동기부여가 되는 짧은 피드백 메시지를 생성해주세요.`;
    
    console.log(`피드백 생성 시작 - 작업: ${data.taskName}, 상태: ${data.status}`);
    
    try {
      const completion = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 100,
        temperature: 0.7,
      });

      const generatedMessage = completion.choices[0].message?.content;
      console.log('피드백 생성 완료:', generatedMessage);

      return Feedback.create({
        ...data,
        message: generatedMessage || '피드백을 생성할 수 없습니다.',
        createdAt: new Date()
      });


    } catch (error) {
      console.error('OpenAI API 호출 중 에러 발생:', error);
      throw error;
    }
  }
} 