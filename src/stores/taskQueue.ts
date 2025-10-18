import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface Task {
  id: string
  keyword: string
  sentence: string
  scenario: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  result?: {
    level: string
    reason: string
    suggestions?: string[]
    explanation?: string
  }
  error?: string
  createdAt: number
  completedAt?: number
}

export const useTaskQueueStore = defineStore('taskQueue', () => {
  const tasks = ref<Task[]>([])
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
    saveTasksToStorage()
    return task.id
  }

  function startProcessing(taskId: string) {
    const task = tasks.value.find((t) => t.id === taskId)
    if (task) {
      task.status = 'processing'
      processingTaskId.value = taskId
      saveTasksToStorage()
    }
  }

  function completeTask(taskId: string, result: Task['result']) {
    const task = tasks.value.find((t) => t.id === taskId)
    if (task) {
      task.status = 'completed'
      task.result = result
      task.completedAt = Date.now()
      processingTaskId.value = null
      saveTasksToStorage()
    }
  }

  function failTask(taskId: string, error: string) {
    const task = tasks.value.find((t) => t.id === taskId)
    if (task) {
      task.status = 'failed'
      task.error = error
      processingTaskId.value = null
      saveTasksToStorage()
    }
  }

  function removeTask(taskId: string) {
    const index = tasks.value.findIndex((t) => t.id === taskId)
    if (index !== -1) {
      tasks.value.splice(index, 1)
      saveTasksToStorage()
    }
  }

  function clearCompletedTasks() {
    tasks.value = tasks.value.filter((task) => task.status !== 'completed')
    saveTasksToStorage()
  }

  function clearAllTasks() {
    tasks.value = []
    processingTaskId.value = null
    saveTasksToStorage()
  }

  function loadTasksFromStorage() {
    const saved = localStorage.getItem('phrase-forge-tasks')
    if (saved) {
      try {
        tasks.value = JSON.parse(saved)
      } catch (error) {
        console.error('Failed to load tasks:', error)
      }
    }
  }

  function saveTasksToStorage() {
    localStorage.setItem('phrase-forge-tasks', JSON.stringify(tasks.value))
  }

  function generateTaskId(): string {
    return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
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
    clearCompletedTasks,
    clearAllTasks,
    loadTasksFromStorage,
  }
})
