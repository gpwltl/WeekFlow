export interface FeedbackData {
  taskId: string;
  taskName: string;
  status: 'in-progress' | 'completed';
  message: string;
  createdAt: Date;
}

export class Feedback {
  taskId: string;
  taskName: string;
  status: 'in-progress' | 'completed';
  message: string;
  createdAt: Date;

  private constructor(data: FeedbackData) {
    this.taskId = data.taskId;
    this.taskName = data.taskName;
    this.status = data.status;
    this.message = data.message;
    this.createdAt = data.createdAt;
  }

  static create(data: FeedbackData): Feedback {
    console.log("feedback API data: ", data);
    if (!data.taskName || !data.status || !data.message) {
      throw new Error('필수 필드가 누락되었습니다.');
    }
    return new Feedback(data);
  }
} 