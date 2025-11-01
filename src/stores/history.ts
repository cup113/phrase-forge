import { defineStore } from 'pinia'
import { computed } from 'vue'
import { useLocalStorage } from '@vueuse/core'
import type { Task } from '../types'
import {
  isSentenceMakingTask,
  isTranslationComparisonTask,
  isSummaryStandardTask,
  isSummaryEvaluationTask,
} from '../types'

export const useHistoryStore = defineStore('history', () => {
  const history = useLocalStorage<Task[]>('phrase-forge-history', [])

  const recentHistory = computed(() => {
    return history.value.slice(0, 50)
  })

  const taskTypeStats = computed(() => {
    const stats = {
      sentenceMaking: 0,
      translationComparison: 0,
      summaryStandard: 0,
      summaryEvaluation: 0,
    }

    history.value.forEach((record) => {
      if (isSentenceMakingTask(record)) {
        stats.sentenceMaking++
      } else if (isTranslationComparisonTask(record)) {
        stats.translationComparison++
      } else if (isSummaryStandardTask(record)) {
        stats.summaryStandard++
      } else if (isSummaryEvaluationTask(record)) {
        stats.summaryEvaluation++
      }
    })

    return stats
  })

  function addRecord(task: Task) {
    if (task.status === 'completed' && task.result) {
      const record = {
        ...task,
        createdAt: task.completedAt || Date.now(),
      }

      history.value.unshift(record)

      if (history.value.length > 100) {
        history.value = history.value.slice(0, 100)
      }
    }
  }

  function removeRecord(recordId: string) {
    const index = history.value.findIndex((record) => record.id === recordId)
    if (index !== -1) {
      history.value.splice(index, 1)
    }
  }

  function clearHistory() {
    history.value = []
  }

  function exportHistory(): string {
    return JSON.stringify(history.value, null, 2)
  }

  function importHistory(data: string): boolean {
    try {
      const imported = JSON.parse(data)
      if (Array.isArray(imported)) {
        history.value = imported
        return true
      }
      return false
    } catch (error) {
      console.error('Failed to import history:', error)
      return false
    }
  }

  return {
    history,
    recentHistory,
    taskTypeStats,
    addRecord,
    removeRecord,
    clearHistory,
    exportHistory,
    importHistory,
  }
})
