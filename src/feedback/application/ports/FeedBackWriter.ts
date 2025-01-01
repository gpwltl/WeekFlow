export interface FeedbackWriter {
  generateFeedback(taskName: string, status: string): Promise<string>;
} 