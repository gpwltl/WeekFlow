import { TaskReader } from '@/src/task/application/ports/TaskReader'
import { Task } from '@/src/task/domain/entities/Task'
import { db, tasks } from '@/shared/db'
import { eq, and, gte, lte } from 'drizzle-orm'
import { TaskMapper } from './mappers/TaskMapper'

export class TaskReadRepository implements TaskReader {
  constructor() {}

  async findById(id: string): Promise<Task | null> {
    const dbTask = await db
      .select()
      .from(tasks)
      .where(eq(tasks.id, id))
      .then(rows => rows[0])
    
    return dbTask ? TaskMapper.toDomain(dbTask) : null
  }

  async findAll(): Promise<Task[]> {
    const dbTasks = await db.select().from(tasks)
    return dbTasks.map(TaskMapper.toDomain)
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
    return dbTasks.map(TaskMapper.toDomain)
  }
} 