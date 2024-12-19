import { TaskValidationError } from '../../errors/TaskErrors';
import { DomainEvent } from '../events/DomainEvent';

export type TaskStatus = 'pending' | 'in-progress' | 'completed'

export interface TaskData {
  title: string
  content: string
  start_date: string
  end_date: string
  author: string
  status: TaskStatus
  started_at?: string | null
  completed_at?: string | null
  estimated_duration?: number | null
  actual_duration?: number | null
  interruption_count?: number
}

export class Task {
  id: string
  title: string
  content: string
  start_date: string
  end_date: string
  author: string
  status: TaskStatus
  started_at?: string | null
  completed_at?: string | null
  estimated_duration?: number | null
  actual_duration?: number | null
  interruption_count: number
  //private domainEvents: DomainEvent[] = [];

  private constructor(data: TaskData & { id: string }) {
    this.id = data.id
    this.title = data.title
    this.content = data.content
    this.start_date = data.start_date
    this.end_date = data.end_date
    this.author = data.author
    this.status = data.status
    this.started_at = data.started_at
    this.completed_at = data.completed_at
    this.estimated_duration = data.estimated_duration
    this.actual_duration = data.actual_duration
    this.interruption_count = data.interruption_count ?? 0
  }

  /**
   * Task 엔티티 생성 및 유효성 검사
   * @throws {TaskValidationError} 유효성 검사 실패시 에러 발생
   */
  static create(data: TaskData & { id: string }): Task {
    // 제목 유효성 검사
    if (!data.title.trim()) {
      throw new TaskValidationError('제목은 필수 입력값입니다')
    }
    if (data.title.length > 100) {
      throw new TaskValidationError('제목은 100자를 초과할 수 없습니다')
    }

    // 날짜 유효성 검사
    const startDate = new Date(data.start_date)
    const endDate = new Date(data.end_date)
    
    if (isNaN(startDate.getTime())) {
      throw new TaskValidationError('시작일이 유효하지 않습니다')
    }
    if (isNaN(endDate.getTime())) {
      throw new TaskValidationError('종료일이 유효하지 않습니다')
    }
    if (startDate > endDate) {
      throw new TaskValidationError('종료일은 시작일보다 이후여야 합니다')
    }

    // 작성자 유효성 검사
    if (!data.author.trim()) {
      throw new TaskValidationError('작성자는 필수 입력값입니다')
    }

    return new Task(data)
  }

  /**
   * Task 업데이트를 위한 새로운 인스턴스 생성
   */
  update(props: Partial<TaskData>): Task {
    return Task.create({
      id: this.id,
      title: props.title ?? this.title,
      content: props.content ?? this.content,
      start_date: props.start_date ?? this.start_date,
      end_date: props.end_date ?? this.end_date,
      author: props.author ?? this.author,
      status: props.status ?? this.status,
      started_at: props.started_at ?? this.started_at,
      completed_at: props.completed_at ?? this.completed_at,
      estimated_duration: props.estimated_duration ?? this.estimated_duration,
      actual_duration: props.actual_duration ?? this.actual_duration,
      interruption_count: props.interruption_count ?? this.interruption_count
    })
  }

  updateStatus(newStatus: TaskStatus): Task {
    const updates = this.calculateStatusUpdates(newStatus)
    return new Task({ ...this, ...updates })
  }

  private calculateStatusUpdates(newStatus: TaskStatus) {
    const now = new Date()
    
    if (newStatus === 'in-progress') {
      return {
        status: newStatus,
        started_at: now.toISOString(),
        completed_at: null,
        actual_duration: null
      }
    }
    
    if (newStatus === 'completed' && this.started_at) {
      const startTime = new Date(this.started_at)
      const actualDuration = Math.floor((now.getTime() - startTime.getTime()) / 1000)
      
      return {
        status: newStatus,
        completed_at: now.toISOString(),
        actual_duration: actualDuration
      }
    }

    if (newStatus === 'pending') {
      return {
        status: newStatus,
        started_at: null,
        completed_at: null,
        estimated_duration: null,
        actual_duration: null
      }
    }

    return { status: newStatus }
  }

  setEstimatedDuration(duration: number): Task {
    return new Task({
      ...this,
      estimated_duration: duration
    });
  }

//   // 도메인 이벤트 추가
//   protected addDomainEvent(event: DomainEvent): void {
//     this.domainEvents.push(event);
//   }

//   // 도메인 이벤트 조회 및 초기화
//   public getDomainEvents(): DomainEvent[] {
//     const events = [...this.domainEvents];
//     this.domainEvents = [];
//     return events;
//   }
} 