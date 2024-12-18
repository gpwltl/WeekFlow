import { SQLiteTaskRepository } from '@/src/task/repositories/SQLiteTaskRepository';
import { CreateTaskUseCase } from '@/src/task/application/usecases/CreateTaskUseCase';
import { GetWeeklyTasksUseCase } from '@/src/task/application/usecases/GetWeeklyTasksUseCase';
import { NextResponse } from 'next/server';

const taskRepository = new SQLiteTaskRepository();
const getWeeklyTasksUseCase = new GetWeeklyTasksUseCase(taskRepository);
const createTaskUseCase = new CreateTaskUseCase(taskRepository);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    let tasks;
    if (startDate && endDate) {
      tasks = await getWeeklyTasksUseCase.execute(
        new Date(startDate),
        new Date(endDate)
      );
    } else {
      tasks = await taskRepository.findAll();
    }

    return NextResponse.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const taskData = await request.json();
    const task = await createTaskUseCase.execute(taskData);
    return NextResponse.json(task);
  } catch (error) {
    console.error('Failed to create task:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error occurred' },
      { status: 400 }
    );
  }
} 