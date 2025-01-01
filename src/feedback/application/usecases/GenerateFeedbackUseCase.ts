import { FeedbackMessage } from '../../domain/entities/FeedBack';
import { FeedbackWriter } from '../ports/FeedBackWriter';

export class GenerateFeedbackUseCase {
  constructor(private readonly openAIPort: FeedbackWriter) {}

  async execute(taskName: string, status: string): Promise<FeedbackMessage> {
    const message = await this.openAIPort.generateFeedback(taskName, status);
    return FeedbackMessage.create(taskName, status, message);
  }
} 