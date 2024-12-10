export interface Task {
  id: string
  title: string
  content: string
  start_date: string
  end_date: string
  author: string
  type: 'meeting' | 'task' | 'break'
  status: 'pending' | 'in-progress' | 'completed'
} 