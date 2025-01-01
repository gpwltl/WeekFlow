import { NextResponse } from 'next/server';
import { GeminiFeedbackWriteRepository } from '@/src/feedback/infrastructure/persistence/GeminiFeedbackWriteRepository';
import { GenerateFeedbackUseCase } from '@/src/feedback/application/usecases/GenerateFeedbackUseCase';

export async function POST(request: Request) {
  try {
    const { taskId, taskName, status } = await request.json();
    
    const feedbackWriter = new GeminiFeedbackWriteRepository();
    const generateFeedbackUseCase = new GenerateFeedbackUseCase(feedbackWriter);
    
    const feedback = await generateFeedbackUseCase.execute(taskId, taskName, status);
    
    return NextResponse.json(feedback);
  } catch (error) {
    console.error('Feedback generation failed:', error);
    return NextResponse.json(
      { error: 'Failed to generate feedback' },
      { status: 500 }
    );
  }
} 