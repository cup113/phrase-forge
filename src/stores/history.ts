import { defineStore } from 'pinia'
import { computed } from 'vue'
import { useLocalStorage } from '@vueuse/core'
import type { Task, HistoryRecord } from '../types'

export const useHistoryStore = defineStore('history', () => {
  const history = useLocalStorage<HistoryRecord[]>('phrase-forge-history', [])

  const recentHistory = computed(() => {
    return history.value.slice(0, 50)
  })

  const keywordStats = computed(() => {
    const stats: Record<string, { count: number; levels: Record<string, number> }> = {}

    history.value.forEach((record) => {
      const keyword = record.keyword || 'unknown'
      if (!stats[keyword]) {
        stats[keyword] = { count: 0, levels: {} }
      }
      stats[keyword].count++
      if (record.result?.level) {
        const level = record.result.level
        stats[keyword].levels[level] = (stats[keyword].levels[level] || 0) + 1
      }
    })

    return stats
  })

  function addRecord(task: Task) {
    if (task.status === 'completed' && task.result) {
      const record: HistoryRecord = {
        ...task,
        status: 'completed' as const,
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
    keywordStats,
    addRecord,
    removeRecord,
    clearHistory,
    exportHistory,
    importHistory,
  }
})
