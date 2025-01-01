import { GenerateFeedbackUseCase } from '@/src/feedback/application/usecases/GenerateFeedbackUseCase';
import { GeminiFeedbackWriteRepository } from '@/src/feedback/infrastructure/persistence/GeminiFeedbackWriteRepository';
import { NextResponse } from 'next/server';

// 팩토리 함수로 의존성 생성 관리
function createUseCases() {
    if (!process.env.OPENAI_API_KEY) {
        throw new Error('OPENAI_API_KEY is not set');
    }

    const openAIService = new GeminiFeedbackWriteRepository(process.env.OPENAI_API_KEY as string);
    return {
        generateFeedbackUseCase: new GenerateFeedbackUseCase(openAIService),
    };
}

export async function POST(request: Request) {
    try {
        const { taskName, status } = await request.json();
        
        if (!taskName || !status) {
            return NextResponse.json(
                { error: '작업 이름과 상태는 필수입니다.' },
                { status: 400 }
            );
        }

        const { generateFeedbackUseCase } = createUseCases();
        const feedback = await generateFeedbackUseCase.execute(taskName, status);

        return NextResponse.json({
            success: true,
            data: feedback
        });
    } catch (error) {
        console.error('피드백 생성 중 에러 발생:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : '알 수 없는 에러가 발생했습니다.' },
            { status: 500 }
        );
    }
} 