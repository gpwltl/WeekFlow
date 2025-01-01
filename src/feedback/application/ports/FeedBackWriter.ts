import { Feedback, FeedbackData } from "../../domain/entities/FeedBack";

export interface FeedbackWriter {
  create(data: FeedbackData): Promise<Feedback>;
} 