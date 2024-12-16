import { db } from '@/shared/db';
import { tasks, taskEvents } from '@/shared/db/schema';
import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';
import { SQLiteTaskRepository } from '@/src/task/repositories/SQLiteTaskRepository'
import { TaskValidationError, TaskNotFoundError } from '@/src/task/errors/TaskErrors'

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

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { status } = body;

    await db.transaction(async (tx) => {
      // 현재 작업 상태 조회
      const currentTask = await tx
        .select()
        .from(tasks)
        .where(eq(tasks.id, params.id))
        .then(rows => rows[0]);

      // 작업 상태 업데이트
      await tx
        .update(tasks)
        .set({
          status,
          // 작업 시작 시간 기록
          started_at: status === 'in-progress' && !currentTask.started_at 
            ? new Date().toISOString() 
            : currentTask.started_at,
          // 작업 완료 시간 기록
          completed_at: status === 'completed' 
            ? new Date().toISOString() 
            : currentTask.completed_at,
          // 완료 시 실제 소요 시간 계산
          actual_duration: status === 'completed' && currentTask.started_at
            ? Math.floor((Date.now() - new Date(currentTask.started_at).getTime()) / 1000)
            : currentTask.actual_duration
        })
        .where(eq(tasks.id, params.id));

      // 이벤트 기록
      await tx.insert(taskEvents).values({
        task_id: params.id,
        event_type: getEventType(status),
        description: `Task status changed to ${status}`
      });
    });

    return NextResponse.json({ message: 'Updated successfully' });
  } catch (error) {
    console.error('Error updating task:', error);
    return NextResponse.json(
      { error: 'Failed to update task' },
      { status: 500 }
    );
  }
}

// 상태에 따른 이벤트 타입 결정
function getEventType(status: string): string {
  switch (status) {
    case 'in-progress':
      return 'STARTED';
    case 'completed':
      return 'COMPLETED';
    case 'pending':
      return 'PAUSED';
    default:
      return 'UPDATED';
  }
} 