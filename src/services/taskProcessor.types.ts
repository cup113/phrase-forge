import type { Task, ApiConfig } from '@/types'

export interface TaskQueueStore {
  pendingTasks: Task[]
  apiConfig: ApiConfig
  startProcessing: (taskId: string) => void
  completeTask: (taskId: string, result: Task['result']) => void
  failTask: (taskId: string, error: string) => void
}
