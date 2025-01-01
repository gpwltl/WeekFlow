export class FeedbackMessage {
  constructor(
    public readonly taskName: string,
    public readonly status: string,
    public readonly message: string,
  ) {}

  static create(taskName: string, status: string, message: string): FeedbackMessage {
    if (!taskName || !status) {
      throw new Error('작업 이름과 상태는 필수입니다.');
    }
    return new FeedbackMessage(taskName, status, message);
  }
} 