import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useLocalStorage } from '@vueuse/core'
import { useHistoryStore } from './history'
import type { Task } from '../types'
import { evaluateSentence } from '@/services/apiService'
import { useApiConfigStore } from './apiConfig'

export const useTaskQueueStore = defineStore('taskQueue', () => {
  const tasks = useLocalStorage<Task[]>('phrase-forge-tasks', [])
  const processingTaskId = ref<string | null>(null)

  const pendingTasks = computed(() => {
    return tasks.value.filter((task) => task.status === 'pending')
  })

  const completedTasks = computed(() => {
    return tasks.value
      .filter((task) => task.status === 'completed')
      .sort((a, b) => (b.completedAt || 0) - (a.completedAt || 0))
  })

  const failedTasks = computed(() => {
    return tasks.value.filter((task) => task.status === 'failed')
  })

  const currentProcessingTask = computed(() => {
    return tasks.value.find((task) => task.id === processingTaskId.value)
  })

  function addTask(keyword: string, sentence: string, scenario: string) {
    const task: Task = {
      id: generateTaskId(),
      keyword,
      sentence,
      scenario,
      status: 'pending',
      createdAt: Date.now(),
    }
    tasks.value.push(task)

    if (processingTaskId.value === null) {
      startProcessing(task.id)
    }

    return task.id
  }

  async function startProcessing(taskId: string) {
    const task = tasks.value.find((t) => t.id === taskId)
    if (task) {
      task.status = 'processing'
      task.startedAt = Date.now()
      const apiConfigStore = useApiConfigStore()
      const response = await evaluateSentence(
        task.keyword,
        task.sentence,
        task.scenario,
        apiConfigStore.apiConfig,
      )
      completeTask(taskId, response)
    }
  }

  function completeTask(taskId: string, result: Task['result']) {
    const task = tasks.value.find((t) => t.id === taskId)
    if (task) {
      const historyStore = useHistoryStore()
      task.status = 'completed'
      task.result = result
      task.completedAt = Date.now()
      processingTaskId.value = null
      historyStore.addRecord(task)
    }
  }

  function failTask(taskId: string, error: string) {
    const task = tasks.value.find((t) => t.id === taskId)
    if (task) {
      task.status = 'failed'
      task.error = error
      processingTaskId.value = null
    }
  }

  function removeTask(taskId: string) {
    const index = tasks.value.findIndex((t) => t.id === taskId)
    if (index !== -1) {
      tasks.value.splice(index, 1)
    }
  }

  function clearAllTasks() {
    tasks.value = []
    processingTaskId.value = null
  }

  function generateTaskId(): string {
    return `task_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
  }

  return {
    tasks,
    pendingTasks,
    completedTasks,
    failedTasks,
    currentProcessingTask,
    processingTaskId,
    addTask,
    startProcessing,
    completeTask,
    failTask,
    removeTask,
    clearAllTasks,
  }
})
