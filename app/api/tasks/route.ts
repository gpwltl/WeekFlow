import { SQLiteTaskRepository } from '@/src/task/repositories/SQLiteTaskRepository';
import { CreateTaskUseCase } from '@/src/task/application/usecases/CreateTaskUseCase';
import { GetWeeklyTasksUseCase } from '@/src/task/application/usecases/GetWeeklyTasksUseCase';
import { NextResponse } from 'next/server';
import { SQLiteEventStore } from '@/src/task/infrastructure/persistence/SQLiteEventStore';
import { EventBus } from '@/src/task/infrastructure/events/EventBus';
import { EventPublisher } from '@/src/task/infrastructure/events/EventPublisher';
import { getDb } from '@/shared/db/config';

// 팩토리 함수로 의존성 생성 관리
async function createUseCases() {
    const db = await getDb();
    const eventStore = new SQLiteEventStore(db);
    const eventBus = new EventBus(eventStore);
    const eventPublisher = new EventPublisher(eventBus);
    const taskRepository = new SQLiteTaskRepository(eventStore, eventPublisher);
    
    return {
        getWeeklyTasksUseCase: new GetWeeklyTasksUseCase(taskRepository),
        createTaskUseCase: new CreateTaskUseCase(taskRepository, eventPublisher),
        taskRepository
    };
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');

        const { getWeeklyTasksUseCase, taskRepository } = await createUseCases();

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
        const { createTaskUseCase } = await createUseCases();
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