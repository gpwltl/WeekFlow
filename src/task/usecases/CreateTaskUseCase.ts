import { Task, TaskData } from '../entities/Task'
import { TaskWriter } from '../repositories/TaskWriter'

export class CreateTaskUseCase {
  constructor(private taskWriter: TaskWriter) {}

  async execute(taskData: TaskData): Promise<Task> {
    // Task 엔티티 생성 시 유효성 검사 수행
    const task = Task.create({
      id: '', // 실제 ID는 Repository에서 생성됨
      ...taskData
    })
    
    // 검증된 task 엔티티를 저장
    return this.taskWriter.create({
      title: task.title,
      content: task.content,
      start_date: task.start_date,
      end_date: task.end_date,
      author: task.author,
      status: task.status
    })
  }
} 