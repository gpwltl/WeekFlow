import { SQLiteTaskRepository } from '@/src/task/repositories/SQLiteTaskRepository';
import { CreateTaskUseCase } from '@/src/task/usecases/CreateTaskUseCase';
import { GetWeeklyTasksUseCase } from '@/src/task/usecases/GetWeeklyTasksUseCase';
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
    const body = await request.json();
    const newTask = await createTaskUseCase.execute(body);
    return NextResponse.json(newTask);
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    );
  }
} 