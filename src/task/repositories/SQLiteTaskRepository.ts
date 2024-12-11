import { db } from '@/shared/db'
import { tasks } from '@/shared/db/schema'
import { eq, and, gte, lte } from 'drizzle-orm'
import { TaskReader } from './TaskReader'
import { TaskWriter } from './TaskWriter'
import { Task, TaskData } from '../entities/Task'
import { randomUUID } from 'crypto'
import { TaskNotFoundError } from '../errors/TaskErrors'

export class SQLiteTaskRepository implements TaskReader, TaskWriter {
  async findAll(): Promise<Task[]> {
    const dbTasks = await db.select().from(tasks)
    return dbTasks.map(task => Task.create({
      id: task.id,
      title: task.title,
      content: task.content,
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
      content: task.content,
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
    const [existingTask] = await db
      .select()
      .from(tasks)
      .where(eq(tasks.id, id))
    
    if (!existingTask) {
      throw new TaskNotFoundError(id)
    }

    const updatedTask = Task.create({
      id,
      title: existingTask.title,
      content: existingTask.content,
      start_date: existingTask.start_date,
      end_date: existingTask.end_date,
      author: existingTask.author,
      status: existingTask.status as 'pending' | 'in-progress' | 'completed',
      ...taskData
    })

    const dbTask = {
      title: updatedTask.title,
      content: updatedTask.content,
      start_date: updatedTask.start_date,
      end_date: updatedTask.end_date,
      author: updatedTask.author,
      status: updatedTask.status
    }

    await db
      .update(tasks)
      .set(dbTask)
      .where(eq(tasks.id, id))

    return updatedTask
  }

  async delete(id: string): Promise<void> {
    await db.delete(tasks).where(eq(tasks.id, id))
  }
} 