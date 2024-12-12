import { Task, TaskData } from '../entities/Task'
import { TaskWriter } from '../repositories/TaskWriter'
import { TaskValidationError } from '../errors/TaskErrors'

export class CreateTaskUseCase {
  constructor(private taskWriter: TaskWriter) {}

  async execute(taskData: TaskData): Promise<Task> {
    // 1. 비즈니스 규칙 검증
    this.validateBusinessRules(taskData)

    // 2. Task 엔티티 생성 (도메인 규칙 검증 포함)
    const task = Task.create({
      id: '', // 실제 ID는 Repository에서 생성됨
      ...taskData
    })
    
    // 3. 저장 및 반환
    return this.taskWriter.create({
      title: task.title,
      content: task.content,
      start_date: task.start_date,
      end_date: task.end_date,
      author: task.author,
      status: task.status
    })
  }

  private validateBusinessRules(taskData: TaskData): void {
    const startDate = new Date(taskData.start_date)
    const endDate = new Date(taskData.end_date)
    const now = new Date()

    // 비즈니스 규칙 1: 과거 날짜에 태스크를 생성할 수 없음
    if (startDate < new Date(now.setHours(0, 0, 0, 0))) {
      throw new TaskValidationError('과거 날짜에는 태스크를 생성할 수 없습니다')
    }

    // 비즈니스 규칙 2: 태스크 기간은 30일을 초과할 수 없음
    const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    if (daysDiff > 30) {
      throw new TaskValidationError('태스크 기간은 30일을 초과할 수 없습니다')
    }

    // 비즈니스 규칙 3: 새로운 태스크의 초기 상태는 'pending' 또는 'in-progress'만 가능
    if (taskData.status === 'completed') {
      throw new TaskValidationError('새로운 태스크는 완료 상태로 생성할 수 없습니다')
    }
  }
} 