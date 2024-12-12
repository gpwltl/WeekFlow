import { NextRequest, NextResponse } from 'next/server'
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