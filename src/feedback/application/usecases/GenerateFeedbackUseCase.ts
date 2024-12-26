import { FeedbackMessage } from '../../domain/feedback.entity';
import { OpenAIPort } from '../../domain/ports/openai.port';

export class GenerateFeedbackUseCase {
  constructor(private readonly openAIPort: OpenAIPort) {}

  async execute(taskName: string, status: string): Promise<FeedbackMessage> {
    const message = await this.openAIPort.generateFeedback(taskName, status);
    return FeedbackMessage.create(taskName, status, message);
  }
} 