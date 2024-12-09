export interface Task {
  id: string
  title: string
  content: string
  startDate: Date
  endDate: Date
  author: string
  type: 'meeting' | 'task' | 'break'
  status: 'pending' | 'in-progress' | 'completed'
}

export const testData: Task[] = [
  {
    id: '1',
    title: '팀 미팅',
    content: '프로젝트 진행 상황 논의',
    startDate: new Date(2023, 11, 2),
    endDate: new Date(2023, 11, 2),
    author: '김철수',
    type: 'meeting',
    status: 'completed'
  },
  {
    id: '2',
    title: '프로젝트 기획',
    content: '새 프로젝트 범위 및 일정 수립',
    startDate: new Date(2023, 11, 2),
    endDate: new Date(2023, 11, 3),
    author: '이영희',
    type: 'task',
    status: 'in-progress'
  },
  {
    id: '3',
    title: '코드 리뷰',
    content: '백엔드 API 코드 리뷰',
    startDate: new Date(2023, 11, 3),
    endDate: new Date(2023, 11, 3),
    author: '박지민',
    type: 'meeting',
    status: 'pending'
  },
  {
    id: '4',
    title: '디자인 미팅',
    content: 'UI/UX 디자인 검토',
    startDate: new Date(2023, 11, 4),
    endDate: new Date(2023, 11, 4),
    author: '최수진',
    type: 'meeting',
    status: 'pending'
  },
  {
    id: '5',
    title: '백엔드 개발',
    content: '사용자 인증 기능 구현',
    startDate: new Date(2023, 11, 4),
    endDate: new Date(2023, 11, 6),
    author: '정민우',
    type: 'task',
    status: 'in-progress'
  }
]

