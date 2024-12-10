import { NextResponse } from 'next/server';
import { SQLiteTaskRepository } from '@/infrastructure/repositories/SQLiteTaskRepository';
import { TaskUseCases } from '@/domain/usecases/TaskUseCases';

const taskRepository = new SQLiteTaskRepository();
const taskUseCases = new TaskUseCases(taskRepository);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    let tasks;
    if (startDate && endDate) {
      tasks = await taskUseCases.getWeeklyTasks(
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
    const newTask = await taskUseCases.createTask(body);
    return NextResponse.json(newTask);
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    );
  }
} 