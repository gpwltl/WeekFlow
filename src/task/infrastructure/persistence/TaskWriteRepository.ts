import { eq } from 'drizzle-orm'
import { db } from '@/shared/db'
import { tasks } from '@/shared/db/schema'
import { TaskMapper } from './mappers/TaskMapper'
import { TaskWriter } from '@/src/task/application/ports/TaskWriter'
import { IEventStore } from '@/src/task/application/ports/IEventStore'
import { IEventPublisher } from '@/src/task/application/ports/IEventPublisher'
import { Task, TaskData, TaskStatus } from '@/src/task/domain/entities/Task'
import { TaskDeletedEvent, TaskCreatedEvent, TaskStatusChangedEvent, TaskUpdatedEvent } from '../../domain/events/TaskEvents'
import { randomUUID } from 'crypto'

export class TaskWriteRepository implements TaskWriter {
  constructor(
    private eventStore: IEventStore,
    private eventPublisher: IEventPublisher
  ) {}

  async create(taskData: TaskData): Promise<Task> {
    const id = randomUUID();
    const task = Task.create({ ...taskData, id });
    
    // 1. DB 저장
    await db.insert(tasks).values(TaskMapper.toPersistence(task));
    
    // 2. 이벤트 생성 및 처리
    const createEvent = new TaskCreatedEvent(id, 'TaskCreated', new Date());
    
    await this.eventStore.saveEvents([createEvent]);
    await this.eventPublisher.publishEvents([createEvent]);
    
    return task;
  }

  async updateTask(id: string, updatedTask: Task): Promise<void> {
    const existingTask = await db
      .select()
      .from(tasks)
      .where(eq(tasks.id, id))
      .then(rows => rows[0])

    if (!existingTask) {
      throw new Error('Task not found');
    }
    
    // DB 업데이트
    await db.update(tasks)
      .set(TaskMapper.toPersistence(updatedTask))
      .where(eq(tasks.id, id))

    // 상태 변경 이벤트 생성 및 처리
    const statusEvent = new TaskUpdatedEvent(id, 'TaskUpdated', new Date());
    await this.eventStore.saveEvents([statusEvent]);
    await this.eventPublisher.publishEvents([statusEvent]);
  }

  async updateStatus(id: string, newStatus: TaskStatus): Promise<void> {
    const existingTask = await db
      .select()
      .from(tasks)
      .where(eq(tasks.id, id))
      .then(rows => rows[0]);

    if (!existingTask) {
      throw new Error('Task not found');
    }

    // DB 상태값만 업데이트
    await db.update(tasks)
      .set({ status: newStatus })
      .where(eq(tasks.id, id));

    // 상태 변경 이벤트 생성 및 처리
    const statusEvent = new TaskStatusChangedEvent(
      id,
      existingTask.status as TaskStatus,
      newStatus,
      'TaskStatusChanged',
      new Date()
    );

    await this.eventStore.saveEvents([statusEvent]);
    await this.eventPublisher.publishEvents([statusEvent]);
  }

  async delete(id: string): Promise<void> {
    // DB에서 삭제
    await db.delete(tasks).where(eq(tasks.id, id));
    
    // 삭제 이벤트 생성 및 처리
    const deleteEvent = new TaskDeletedEvent(id, 'TaskDeleted', new Date());
    await this.eventStore.saveEvents([deleteEvent]);
    await this.eventPublisher.publishEvents([deleteEvent]);
  }
} 