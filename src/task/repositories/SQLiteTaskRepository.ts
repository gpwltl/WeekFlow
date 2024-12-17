import { eq, and, gte, lte } from 'drizzle-orm'
import { TaskReader } from './TaskReader'
import { TaskWriter } from './TaskWriter'
import { Task, TaskData } from '../entities/Task'
import { randomUUID } from 'crypto'
import { tasks, taskEvents } from '@/shared/db/schema'
import { db } from '@/shared/db'

export class SQLiteTaskRepository implements TaskReader, TaskWriter {
  async findAll(): Promise<Task[]> {
    const dbTasks = await db.select().from(tasks)
    return dbTasks.map(task => Task.create({
      id: task.id,
      title: task.title,
      content: task.content ?? '',
      start_date: task.start_date,
      end_date: task.end_date,
      author: task.author,
      status: task.status as 'pending' | 'in-progress' | 'completed'
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
      status: task.status as 'pending' | 'in-progress' | 'completed'
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
      status: newTask.status
    }

    await db.insert(tasks).values(dbTask)
    return newTask
  }

  async update(id: string, taskData: Partial<TaskData>): Promise<Task> {
    return await db.transaction(async (tx) => {
      // 현재 작업 상태 조회
      const currentTask = await tx
        .select()
        .from(tasks)
        .where(eq(tasks.id, id))
        .then(rows => rows[0]);

      // 작업 상태 업데이트
      await tx
        .update(tasks)
        .set({
          ...taskData,
          started_at: taskData.status === 'in-progress' && !currentTask.started_at 
            ? new Date().toISOString() 
            : currentTask.started_at,
          completed_at: taskData.status === 'completed' 
            ? new Date().toISOString() 
            : currentTask.completed_at,
        })
        .where(eq(tasks.id, id));

      // 이벤트 기록
      if (taskData.status) {
        await tx.insert(taskEvents).values({
          task_id: id,
          event_type: this.getEventType(taskData.status),
          description: `Task status changed to ${taskData.status}`
        });
      }

      // 업데이트된 작업 조회
      const updatedDbTask = await tx
        .select()
        .from(tasks)
        .where(eq(tasks.id, id))
        .then(rows => rows[0]);

      // Task 엔티티로 변환하여 바로 반환
      return Task.create({
        id: updatedDbTask.id,
        title: updatedDbTask.title,
        content: updatedDbTask.content ?? '',
        start_date: updatedDbTask.start_date,
        end_date: updatedDbTask.end_date,
        author: updatedDbTask.author,
        status: updatedDbTask.status as 'pending' | 'in-progress' | 'completed'
      });
    });
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
} 