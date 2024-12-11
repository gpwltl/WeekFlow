import { TaskValidationError } from '../errors/TaskErrors'

export interface TaskData {
  title: string
  content: string
  start_date: string
  end_date: string
  author: string
  status: 'pending' | 'in-progress' | 'completed'
}

export class Task {
  private constructor(
    public readonly id: string,
    public readonly title: string,
    public readonly content: string,
    public readonly start_date: string,
    public readonly end_date: string,
    public readonly author: string,
    public readonly status: 'pending' | 'in-progress' | 'completed'
  ) {}

  /**
   * Task 엔티티 생성 및 유효성 검사
   * @throws {TaskValidationError} 유효성 검사 실패시 에러 발생
   */
  static create(props: TaskData & { id: string }): Task {
    // 제목 유효성 검사
    if (!props.title.trim()) {
      throw new TaskValidationError('제목은 필수 입력값입니다')
    }
    if (props.title.length > 100) {
      throw new TaskValidationError('제목은 100자를 초과할 수 없습니다')
    }

    // 날짜 유효성 검사
    const startDate = new Date(props.start_date)
    const endDate = new Date(props.end_date)
    
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
    if (!props.author.trim()) {
      throw new TaskValidationError('작성자는 필수 입력값입니다')
    }

    return new Task(
      props.id,
      props.title.trim(),
      props.content,
      props.start_date,
      props.end_date,
      props.author.trim(),
      props.status
    )
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
      status: props.status ?? this.status
    })
  }
} 