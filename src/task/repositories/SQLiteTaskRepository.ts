import { db, tasks } from '@/shared/db'
import { eq, and, gte, lte } from 'drizzle-orm'
import { TaskReader } from './TaskReader'
import { TaskWriter } from './TaskWriter'
import { Task } from '../entities/Task'
import { randomUUID } from 'crypto'

export class SQLiteTaskRepository implements TaskReader, TaskWriter {
  async findAll(): Promise<Task[]> {
    return db.select().from(tasks)
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<Task[]> {
    return db
      .select()
      .from(tasks)
      .where(
        and(
          gte(tasks.start_date, startDate.toISOString()),
          lte(tasks.end_date, endDate.toISOString())
        )
      )
  }

  async create(task: Omit<Task, 'id'>): Promise<Task> {
    const newTask = { ...task, id: randomUUID() }
    await db.insert(tasks).values(newTask)
    return newTask
  }

  async update(id: string, task: Partial<Task>): Promise<Task> {
    const [updatedTask] = await db
      .update(tasks)
      .set(task)
      .where(eq(tasks.id, id))
      .returning()
    return updatedTask
  }

  async delete(id: string): Promise<void> {
    await db.delete(tasks).where(eq(tasks.id, id))
  }
} 