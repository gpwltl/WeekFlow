import { FeedbackMessage } from '../../domain/entities/FeedBack';
import { OpenAIPort } from '../ports/FeedBackReader';

export class GenerateFeedbackUseCase {
  constructor(private readonly openAIPort: OpenAIPort) {}

  async execute(taskName: string, status: string): Promise<FeedbackMessage> {
    const message = await this.openAIPort.generateFeedback(taskName, status);
    return FeedbackMessage.create(taskName, status, message);
  }
} 