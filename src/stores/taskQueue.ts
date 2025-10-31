import { defineStore } from 'pinia'
import { computed } from 'vue'
import { useLocalStorage } from '@vueuse/core'
import { useHistoryStore } from './history'
import {
  type Task,
  type TaskResult,
  type SentenceMakingTaskCore,
  type TranslationComparisonTaskCore,
  isSentenceMakingTask,
} from '../types'
import { evaluateSentence, evaluateTranslation } from '@/services/apiService'
import { useApiConfigStore } from './apiConfig'

export const useTaskQueueStore = defineStore('taskQueue', () => {
  const tasks = useLocalStorage<Task[]>('phrase-forge-tasks', [])
  const inputTaskForm = useLocalStorage('phrase-forge-input-task-form', {
    keyword: '',
    sentence: '',
    scenario: '',
  })

  const completedTasks = computed(() => {
    return tasks.value
      .filter((task) => task.status === 'completed')
      .sort((a, b) => (b.completedAt || 0) - (a.completedAt || 0))
  })

  const incompleteTasks = computed(() => {
    return tasks.value.filter((task) => task.status === 'incomplete')
  })

  const hasIncompleteTasks = computed(() => incompleteTasks.value.length > 0)

  function addTask(taskData: SentenceMakingTaskCore | TranslationComparisonTaskCore) {
    const task: Task = {
      ...taskData,
      id: generateTaskId(),
      status: 'pending',
      createdAt: Date.now(),
    }
    tasks.value.push(task)

    startProcessing(task.id)

    return task.id
  }

  // 批量添加未完成造句任务
  function addIncompleteTasks(keywords: string[]) {
    const newTasks: Task[] = keywords
      .filter((keyword) => keyword.trim())
      .map((keyword) => ({
        type: 'sentence-making',
        id: generateTaskId(),
        keyword: keyword.trim(),
        sentence: '',
        scenario: '',
        status: 'incomplete',
        createdAt: Date.now(),
      }))

    tasks.value.push(...newTasks)
    return newTasks.length
  }

  // 获取下一个未完成任务
  function getNextIncompleteTask() {
    const incompleteTask = tasks.value.find(
      (task) => task.status === 'incomplete' && task.type === 'sentence-making',
    )
    if (incompleteTask && isSentenceMakingTask(incompleteTask)) {
      inputTaskForm.value.keyword = incompleteTask.keyword
      inputTaskForm.value.sentence = ''
      inputTaskForm.value.scenario = ''
      return incompleteTask
    }
    return null
  }

  // 完成未完成任务（转换为待处理状态）
  function completeIncompleteTask(taskId: string, sentence: string, scenario: string) {
    const task = tasks.value.find((t) => t.id === taskId)
    if (task && task.status === 'incomplete' && task.type === 'sentence-making') {
      task.sentence = sentence
      task.scenario = scenario
      task.status = 'pending'
      startProcessing(task.id)
      return true
    }
    return false
  }

  // 重新造句 - 基于现有任务创建新任务
  function recreateTask(taskId: string) {
    const task = tasks.value.find((t) => t.id === taskId)
    if (task && task.type === 'sentence-making') {
      inputTaskForm.value.keyword = task.keyword
      inputTaskForm.value.scenario = task.scenario
    }
  }

  function retryTask(taskId: string) {
    const task = tasks.value.find((t) => t.id === taskId)
    if (task) {
      task.status = 'pending'
      task.error = undefined
      task.startedAt = Date.now()
      startProcessing(task.id)
    }
  }

  async function startProcessing(taskId: string) {
    const task = tasks.value.find((t) => t.id === taskId)
    if (task) {
      task.status = 'processing'
      task.startedAt = Date.now()
      const apiConfigStore = useApiConfigStore()
      try {
        if (task.type === 'sentence-making') {
          const response = await evaluateSentence(task.keyword, task.sentence, task.scenario, {
            ...apiConfigStore.apiConfig,
            endpoint: apiConfigStore.getEndpointForTaskType('sentence-making'),
          })
          completeTask(taskId, response)
        } else if (task.type === 'translation-comparison') {
          const response = await evaluateTranslation(task.original, task.translations, {
            ...apiConfigStore.apiConfig,
            endpoint: apiConfigStore.getEndpointForTaskType('translation-comparison'),
          })
          completeTask(taskId, response)
        }
      } catch (error) {
        failTask(taskId, error instanceof Error ? error.message : 'Unknown error')
      }
    }
  }

  function completeTask(taskId: string, result: TaskResult) {
    const task = tasks.value.find((t) => t.id === taskId)
    if (task) {
      const historyStore = useHistoryStore()
      task.status = 'completed'
      task.result = result
      task.completedAt = Date.now()
      historyStore.addRecord(task)
    }
  }

  function failTask(taskId: string, error: string) {
    const task = tasks.value.find((t) => t.id === taskId)
    if (task) {
      task.status = 'failed'
      task.error = error
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
  }

  function generateTaskId(): string {
    return `task_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
  }

  return {
    tasks,
    inputTaskForm,
    completedTasks,
    incompleteTasks,
    hasIncompleteTasks,
    addTask,
    addIncompleteTasks,
    getNextIncompleteTask,
    completeIncompleteTask,
    startProcessing,
    completeTask,
    failTask,
    removeTask,
    clearAllTasks,
    recreateTask,
    retryTask,
  }
})
