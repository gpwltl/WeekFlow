import { eq, and, gte, lte, sql } from 'drizzle-orm'
import { TaskReader } from './TaskReader'
import { TaskWriter } from './TaskWriter'
import { Task, TaskData, TaskStatus } from '../domain/entities/Task'
import { randomUUID } from 'crypto'
import { tasks, taskEvents } from '@/shared/db/schema'
import { db } from '@/shared/db'
import { TaskNotFoundError } from '../errors/TaskErrors'

export class SQLiteTaskRepository implements TaskReader, TaskWriter {
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
    const currentTask = await this.findById(id);
    if (!currentTask) throw new TaskNotFoundError(id);

    let updates: Partial<TaskData> = { ...taskData };

    // 상태에 따른 필드 업데이트
    if (updates.status === 'in-progress') {
      updates = {
        ...updates,
        started_at: new Date().toISOString(),
        completed_at: null,
        estimated_duration: 3600,
        actual_duration: null
      };
    } else if (updates.status === 'completed' && currentTask.started_at) {
      const startTime = new Date(currentTask.started_at);
      const now = new Date();
      updates = {
        ...updates,
        completed_at: now.toISOString(),
        actual_duration: Math.floor((now.getTime() - startTime.getTime()) / 1000)
      };
    } else if (updates.status === 'pending') {
      updates = {
        ...updates,
        started_at: null,
        completed_at: null,
        estimated_duration: null,
        actual_duration: null
      };
    }

    // DB 업데이트
    await db
      .update(tasks)
      .set(updates)
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
    await db.delete(tasks).where(eq(tasks.id, id))
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