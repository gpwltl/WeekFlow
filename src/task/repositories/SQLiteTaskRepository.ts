import { eq, and, gte, lte, sql } from 'drizzle-orm'
import { Task, TaskData, TaskStatus } from '../domain/entities/Task'
import { randomUUID } from 'crypto'
import { tasks, taskEvents } from '@/shared/db/schema'
import { db } from '@/shared/db'
import { TaskNotFoundError } from '../errors/TaskErrors'
import { TaskReader } from '../application/ports/TaskReader'
import { TaskWriter } from '../application/ports/TaskWriter'  
import { SQLiteEventStore } from '../infrastructure/persistence/SQLiteEventStore'
import { EventPublisher } from '../infrastructure/events/EventPublisher'

export class SQLiteTaskRepository implements TaskReader, TaskWriter {
  constructor(
    private eventStore: SQLiteEventStore,
    private eventPublisher: EventPublisher
  ) {}

  async findById(id: string): Promise<Task | null> {
    const dbTask = await db.select().from(tasks).where(eq(tasks.id, id)).then(rows => rows[0])
    if (!dbTask) return null
    return Task.create({
      id: dbTask.id,
      title: dbTask.title,
      content: dbTask.content ?? '',
      start_date: dbTask.start_date,
      end_date: dbTask.end_date,
      author: dbTask.author,
      status: dbTask.status as TaskStatus,
      started_at: dbTask.started_at,
      completed_at: dbTask.completed_at,
      estimated_duration: dbTask.estimated_duration,
      actual_duration: dbTask.actual_duration,
      interruption_count: dbTask.interruption_count ?? 0
    })
  }
  
  async findAll(): Promise<Task[]> {
    const dbTasks = await db.select().from(tasks)
    return dbTasks.map(task => Task.create({
      id: task.id,
      title: task.title,
      content: task.content ?? '',
      start_date: task.start_date,
      end_date: task.end_date,
      author: task.author,
      status: task.status as TaskStatus,
      started_at: task.started_at,
      completed_at: task.completed_at,
      estimated_duration: task.estimated_duration,
      actual_duration: task.actual_duration,
      interruption_count: task.interruption_count ?? 0
    }))
  }


  async findByDateRange(startDate: Date, endDate: Date): Promise<Task[]> {
    const dbTasks = await db
      .select()
      .from(tasks)
      .where(
        and(
          gte(tasks.start_date, startDate.toISOString()),
          lte(tasks.end_date, endDate.toISOString())
        )
      )
    return dbTasks.map(task => Task.create({
      id: task.id,
      title: task.title,
      content: task.content ?? '',
      start_date: task.start_date,
      end_date: task.end_date,
      author: task.author,
      status: task.status as TaskStatus,
      started_at: task.started_at,
      completed_at: task.completed_at,
      estimated_duration: task.estimated_duration,
      actual_duration: task.actual_duration,
      interruption_count: task.interruption_count ?? 0
    }))
  }

  async create(taskData: TaskData): Promise<Task> {
    const id = randomUUID()
    const newTask = Task.create({
      id,
      ...taskData
    })

    const dbTask = {
      id: newTask.id,
      title: newTask.title,
      content: newTask.content,
      start_date: newTask.start_date,
      end_date: newTask.end_date,
      author: newTask.author,
      status: newTask.status,
      started_at: newTask.started_at,
      completed_at: newTask.status === 'completed' ? newTask.completed_at : null,
      estimated_duration: newTask.estimated_duration,
      actual_duration: newTask.actual_duration,
      interruption_count: newTask.interruption_count ?? 0
    }

    await db.insert(tasks).values(dbTask)
    return newTask
  }

  async update(id: string, taskData: Partial<TaskData>): Promise<Task> {
    // 현재 태스크 확인
    const existingTask = await this.findById(id);
    if (!existingTask) {
        throw new TaskNotFoundError(`Task with id ${id} not found`);
    }

    // Drizzle update 쿼리 실행
    await db.update(tasks)
        .set(taskData)
        .where(eq(tasks.id, id));

    return await this.findById(id) as Task;
  }

  private getEventType(status: string): string {
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

  async delete(id: string): Promise<void> {
    try {
      // 트랜잭션 시작
      await db.transaction(async (tx) => {
        // 1. 먼저 관련된 이벤트들을 삭제
        await tx
          .delete(taskEvents)
          .where(eq(taskEvents.task_id, id));

        // 2. 태스크 삭제
        const result = await tx
          .delete(tasks)
          .where(eq(tasks.id, id));

        // 3. 태스크가 존재하지 않는 경우 에러 발생
        if (!result) {
          throw new TaskNotFoundError(id);
        }
      });
    } catch (error) {
      if (error instanceof TaskNotFoundError) {
        throw error;
      }
      throw new Error(`Failed to delete task: ${error}`);
    }
  }

  async calculateEstimatedDuration(taskTitle: string): Promise<number> {
    // 1. 유사한 제목의 완료된 작업들 찾기
    const similarTasks = await db
      .select({
        title: tasks.title,
        actual_duration: tasks.actual_duration
      })
      .from(tasks)
      .where(
        and(
          eq(tasks.status, 'completed'),
          sql`tasks.title LIKE '%' || ${taskTitle} || '%'`
        )
      )
      .limit(5);

    if (similarTasks.length > 0) {
      // 2. 유사 작업들의 평균 소요시간 계산
      const avgDuration = similarTasks.reduce((sum, task) => 
        sum + (task.actual_duration || 0), 0) / similarTasks.length;
      
      // 3. 약간의 버퍼(20%)를 추가
      return Math.ceil(avgDuration * 1.2);
    }

    // 유사 작업이 없으면 기본값 (1시간)
    return 3600;
  }

} 