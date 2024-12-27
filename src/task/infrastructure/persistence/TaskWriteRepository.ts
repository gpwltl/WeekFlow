import { eq } from 'drizzle-orm'
import { db } from '@/shared/db'
import { tasks } from '@/shared/db/schema'
import { randomUUID } from 'crypto'
import { TaskMapper } from './mappers/TaskMapper'
import { TaskWriter } from '@/src/task/application/ports/TaskWriter'
import { IEventStore } from '@/src/task/application/ports/IEventStore'
import { IEventPublisher } from '@/src/task/application/ports/IEventPublisher'
import { Task, TaskData } from '@/src/task/domain/entities/Task'

export class TaskWriteRepository implements TaskWriter {
  constructor(
    private eventStore: IEventStore,
    private eventPublisher: IEventPublisher
  ) {}

  async create(taskData: TaskData): Promise<Task> {
    const id = randomUUID()
    const task = Task.create({ id, ...taskData })
    
    await db.insert(tasks).values(TaskMapper.toPersistence(task))
    
    const events = task.clearEvents()
    await this.eventStore.saveEvents(events)
    await this.eventPublisher.publishEvents(events)
    
    return task
  }

  async update(id: string, updatedTask: Task): Promise<void> {
    await db.update(tasks)
      .set(TaskMapper.toPersistence(updatedTask))
      .where(eq(tasks.id, id))
  }

  async delete(id: string): Promise<void> {
    await db.delete(tasks).where(eq(tasks.id, id))
  }
} 