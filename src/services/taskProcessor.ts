import { apiService } from './apiService'
import type { Task } from '@/stores/taskQueue'

class TaskProcessor {
  private isProcessing = false

  async startProcessing(
    getPendingTasks: () => Task[],
    onStartProcessing: (taskId: string) => void,
    onComplete: (taskId: string, result: any) => void,
    onError: (taskId: string, error: string) => void,
  ) {
    if (this.isProcessing) {
      return
    }

    this.isProcessing = true

    while (this.isProcessing) {
      const pendingTasks = getPendingTasks()

      if (pendingTasks.length === 0) {
        // 没有待处理任务，等待一段时间再检查
        await new Promise((resolve) => setTimeout(resolve, 1000))
        continue
      }

      const task = pendingTasks[0]

      if (!task) {
        await new Promise((resolve) => setTimeout(resolve, 100))
        continue
      }

      try {
        onStartProcessing(task.id)

        const result = await apiService.processTask(task)

        onComplete(task.id, result)
      } catch (error) {
        console.error(`处理任务失败: ${task.id}`, error)
        onError(task.id, error instanceof Error ? error.message : '未知错误')
      }

      // 处理完一个任务后稍作延迟，避免过于频繁的API调用
      await new Promise((resolve) => setTimeout(resolve, 500))
    }
  }

  stopProcessing() {
    this.isProcessing = false
  }

  getProcessingStatus(): boolean {
    return this.isProcessing
  }
}

export const taskProcessor = new TaskProcessor()
