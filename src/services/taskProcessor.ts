import { ref } from 'vue'
import { evaluateSentence } from './apiService'
import type { Task, ApiConfig } from '@/types'

interface TaskQueueStore {
  pendingTasks: Task[]
  startProcessing: (taskId: string) => void
  completeTask: (taskId: string, result: Task['result']) => void
  failTask: (taskId: string, error: string) => void
}

interface ApiConfigStore {
  apiConfig: ApiConfig
}

export function useTaskProcessor(taskQueueStore: TaskQueueStore, apiConfigStore: ApiConfigStore) {
  const isProcessing = ref(false)

  async function processNext() {
    if (isProcessing.value) return

    const pending = taskQueueStore.pendingTasks
    if (pending.length === 0) return

    const task = pending[0]
    if (!task) return

    isProcessing.value = true

    try {
      taskQueueStore.startProcessing(task.id)
      const result = await evaluateSentence(
        task.keyword,
        task.sentence,
        task.scenario,
        apiConfigStore.apiConfig,
      )
      taskQueueStore.completeTask(task.id, result)
    } catch (error) {
      taskQueueStore.failTask(task.id, error instanceof Error ? error.message : '未知错误')
    } finally {
      isProcessing.value = false
      setTimeout(processNext, 500)
    }
  }

  return { processNext, isProcessing }
}
