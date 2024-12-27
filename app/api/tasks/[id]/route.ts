import { NextRequest, NextResponse } from 'next/server';
import { TaskValidationError, TaskNotFoundError } from '@/src/task/errors/TaskErrors'
import { TaskUseCases } from '@/src/task/infrastructure/factories/taskUseCases'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const taskData = await request.json();
    
    if (!params.id) {
      return NextResponse.json(
        { error: 'Task ID is required' },
        { status: 400 }
      );
    }

    const { updateTaskUseCase } = await TaskUseCases();
    await updateTaskUseCase.execute(params.id, taskData);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in PUT route:', error);
    if (error instanceof TaskValidationError) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }
    if (error instanceof TaskNotFoundError) {
      return NextResponse.json(
        { error: '해당 태스크를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }
    return NextResponse.json(
      { error: '태스크 수정에 실패했습니다.' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { deleteTaskUseCase } = await TaskUseCases();
    await deleteTaskUseCase.execute(params.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof TaskNotFoundError) {
      return NextResponse.json(
        { error: '해당 태스크를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }
    console.error('Error deleting task:', error)
    return NextResponse.json(
      { error: '태스크 삭제에 실패했습니다.' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { status } = await request.json();
    const { updateTaskStatusUseCase } = await TaskUseCases();
    await updateTaskStatusUseCase.execute(params.id, status);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating task status:', error)
    return NextResponse.json(
      { error: 'Failed to update task status' },
      { status: 500 }
    )
  }
}

// 상태에 따른 이벤트 타입 결정
function getEventType(status: string): string {
  switch (status) {
    case 'in-progress':
      return 'START';
    case 'completed':
      return 'COMPLETE';
    case 'pending':
      return 'PAUSE';
    default:
      return 'UPDATED';
  }
} 