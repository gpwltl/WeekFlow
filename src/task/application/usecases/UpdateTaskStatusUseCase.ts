import { Task } from '../../domain/entities/Task'
import { SQLiteTaskRepository } from '../../repositories/SQLiteTaskRepository'

export class UpdateTaskStatusUseCase {
  constructor(private taskRepository: SQLiteTaskRepository) {}

  async execute(taskId: string, newStatus: Task['status']): Promise<void> {
    // 1. 기존 태스크 조회
    const task = await this.taskRepository.findById(taskId)
    if (!task) {
      throw new Error('Task not found')
    }

    // 2. 상태 업데이트
    task.status = newStatus

    // 3. 저장
    await this.taskRepository.update(taskId, task)
  }
}
