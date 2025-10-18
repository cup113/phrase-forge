import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Task } from './taskQueue'

export interface HistoryRecord {
  id: string
  keyword: string
  sentence: string
  scenario: string
  level: string
  reason: string
  suggestions?: string[]
  explanation?: string
  createdAt: number
}

export const useHistoryStore = defineStore('history', () => {
  const history = ref<HistoryRecord[]>([])

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
      if (record.level) {
        const level = record.level
        stats[keyword].levels[level] = (stats[keyword].levels[level] || 0) + 1
      }
    })

    return stats
  })

  function addRecord(task: Task) {
    if (task.status === 'completed' && task.result) {
      const record: HistoryRecord = {
        id: task.id,
        keyword: task.keyword,
        sentence: task.sentence,
        scenario: task.scenario,
        level: task.result.level,
        reason: task.result.reason,
        suggestions: task.result.suggestions,
        explanation: task.result.explanation,
        createdAt: task.completedAt || Date.now(),
      }

      history.value.unshift(record)

      if (history.value.length > 100) {
        history.value = history.value.slice(0, 100)
      }

      saveHistoryToStorage()
    }
  }

  function removeRecord(recordId: string) {
    const index = history.value.findIndex((record) => record.id === recordId)
    if (index !== -1) {
      history.value.splice(index, 1)
      saveHistoryToStorage()
    }
  }

  function clearHistory() {
    history.value = []
    saveHistoryToStorage()
  }

  function loadHistoryFromStorage() {
    const saved = localStorage.getItem('phrase-forge-history')
    if (saved) {
      try {
        history.value = JSON.parse(saved)
      } catch (error) {
        console.error('Failed to load history:', error)
      }
    }
  }

  function saveHistoryToStorage() {
    localStorage.setItem('phrase-forge-history', JSON.stringify(history.value))
  }

  function exportHistory(): string {
    return JSON.stringify(history.value, null, 2)
  }

  function importHistory(data: string): boolean {
    try {
      const imported = JSON.parse(data)
      if (Array.isArray(imported)) {
        history.value = imported
        saveHistoryToStorage()
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
    loadHistoryFromStorage,
    exportHistory,
    importHistory,
  }
})
