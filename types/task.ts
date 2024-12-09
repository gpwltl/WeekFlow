export interface Task {
  id: string
  title: string
  deadline: Date
  author: string
  createdAt: Date
  status: 'pending' | 'completed'
}

