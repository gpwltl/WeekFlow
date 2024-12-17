import { NextRequest, NextResponse } from 'next/server';
import { SQLiteTaskRepository } from '@/src/task/repositories/SQLiteTaskRepository'
import { TaskValidationError, TaskNotFoundError } from '@/src/task/errors/TaskErrors'
import { UpdateTaskStatusUseCase } from '@/src/task/usecases/UpdateTaskStatusUseCase'
import { SQLiteTaskEventPublisher } from '@/src/task/infrastructure/SQLiteTaskEventPublisher';

const taskRepository = new SQLiteTaskRepository()

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const taskData = await request.json()
    const updatedTask = await taskRepository.update(params.id, taskData)
    
    return NextResponse.json(updatedTask)
  } catch (error) {
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
    console.error('Error updating task:', error)
    return NextResponse.json(
      { error: '태스크 수정에 실했습니다.' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await taskRepository.delete(params.id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting task:', error)
    return NextResponse.json(
      { error: '태스크 삭제에 실패했습니다.' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const { status } = await request.json();
    
    const repository = new SQLiteTaskRepository();
    const eventPublisher = new SQLiteTaskEventPublisher();
    
    const useCase = new UpdateTaskStatusUseCase(
      repository, 
      repository,
      eventPublisher
    );
    
    const updatedTask = await useCase.execute(params.id, status);
    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error('Error updating task status:', error);
    return NextResponse.json(
      { error: 'Failed to update task status' },
      { status: 500 }
    );
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