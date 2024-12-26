export interface OpenAIPort {
  generateFeedback(taskName: string, status: string): Promise<string>;
} 