import { NextRequest, NextResponse } from 'next/server';
import { SQLiteTaskRepository } from '@/src/task/repositories/SQLiteTaskRepository'
import { TaskValidationError, TaskNotFoundError } from '@/src/task/errors/TaskErrors'
import { UpdateTaskStatusUseCase } from '@/src/task/application/usecases/UpdateTaskStatusUseCase'
import { EventBus } from '@/src/task/infrastructure/events/EventBus';
import { SQLiteEventStore } from '@/src/task/infrastructure/persistence/SQLiteEventStore';
import { EventPublisher } from '@/src/task/infrastructure/events/EventPublisher';
import { getDb } from '@/shared/db/config';

// 팩토리 함수를 async로 변경
async function createTaskRepository() {
    const db = await getDb();
    const eventStore = new SQLiteEventStore(db);
    const eventBus = new EventBus(eventStore);
    const eventPublisher = new EventPublisher(eventBus);
    return new SQLiteTaskRepository(eventStore, eventPublisher);
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // 요청 데이터 로깅
    const rawData = await request.text();
    console.log('Raw request data:', rawData);
    
    const taskData = rawData ? JSON.parse(rawData) : null;
    console.log('Parsed taskData:', taskData);
    
    if (!taskData || !taskData.title) {
      return NextResponse.json(
        { error: '올바른 태스크 데이터가 필요합니다.' },
        { status: 400 }
      )
    }

    const taskRepository = await createTaskRepository();
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
    const taskRepository = await createTaskRepository();
    await taskRepository.delete(params.id)
    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof TaskNotFoundError) {
      return NextResponse.json(
        { error: '해당 태스크를 찾을 �� 없습니다.' },
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

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const { status } = await request.json();
    
    const taskRepository = await createTaskRepository();

    const useCase = new UpdateTaskStatusUseCase(
      taskRepository,
      new EventBus(new SQLiteEventStore(await getDb()))
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