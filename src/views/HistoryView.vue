<template>
  <div class="history-page">
    <AppHeader title="学习历史" subtitle="查看您的英语学习进度和成果" />

    <main class="page-content">
      <!-- 学习进度统计 -->
      <section class="stats-section">
        <ProgressStats />
      </section>

      <!-- 操作栏 -->
      <section class="actions-section">
        <div class="actions-bar">
          <div class="search-filter">
            <input
              v-model="searchKeyword"
              type="text"
              placeholder="搜索关键词..."
              class="search-input"
            />
            <select v-model="filterLevel" class="filter-select">
              <option value="">所有评分</option>
              <option value="A+">A+</option>
              <option value="A">A</option>
              <option value="B+">B+</option>
              <option value="B">B</option>
              <option value="C+">C+</option>
              <option value="C">C</option>
            </select>
          </div>
          <div class="action-buttons">
            <button class="btn-secondary" @click="exportHistory">导出数据</button>
            <button class="btn-danger" @click="clearHistory" :disabled="history.length === 0">
              清空历史
            </button>
          </div>
        </div>
      </section>

      <!-- 历史记录列表 -->
      <section class="history-section">
        <div v-if="filteredHistory.length > 0" class="history-list">
          <TaskItem
            v-for="record in filteredHistory"
            :key="record.id"
            :task="record"
            status="completed"
          >
            <template #actions>
              <div class="history-actions">
                <span class="time">{{ formatTime(record.createdAt) }}</span>
                <button class="btn-danger btn-small" @click="removeRecord(record.id)">删除</button>
              </div>
            </template>
          </TaskItem>
        </div>

        <div v-else class="empty-state">
          <div class="empty-icon">📚</div>
          <h3>暂无历史记录</h3>
          <p>开始使用语匠来记录您的英语学习历程吧！</p>
          <router-link to="/" class="btn-primary">开始练习</router-link>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import AppHeader from '@/components/AppHeader.vue'
import TaskItem from '@/components/TaskItem.vue'
import { useHistoryStore } from '@/stores/history'
import { isSentenceMakingTask } from '@/types'
import ProgressStats from '@/components/ProgressStats.vue'

const historyStore = useHistoryStore()

const searchKeyword = ref('')
const filterLevel = ref('')

const history = computed(() => historyStore.recentHistory.filter(isSentenceMakingTask))

const filteredHistory = computed(() => {
  let filtered = history.value

  if (searchKeyword.value) {
    filtered = filtered.filter(
      (record) =>
        record.keyword.toLowerCase().includes(searchKeyword.value.toLowerCase()) ||
        record.sentence.toLowerCase().includes(searchKeyword.value.toLowerCase()),
    )
  }

  if (filterLevel.value) {
    filtered = filtered.filter((record) => record.result?.level === filterLevel.value)
  }

  return filtered
})

function formatTime(timestamp: number): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now.getTime() - timestamp

  // 如果是今天
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // 如果是昨天
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  if (date.toDateString() === yesterday.toDateString()) {
    return (
      '昨天 ' +
      date.toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit',
      })
    )
  }

  // 一周内
  if (diff < 7 * 24 * 60 * 60 * 1000) {
    const days = Math.floor(diff / (24 * 60 * 60 * 1000))
    return `${days}天前`
  }

  // 更早的时间
  return date.toLocaleDateString('zh-CN')
}

function removeRecord(recordId: string) {
  if (confirm('确定要删除这条记录吗？')) {
    historyStore.removeRecord(recordId)
  }
}

function clearHistory() {
  if (confirm('确定要清空所有历史记录吗？此操作不可恢复。')) {
    historyStore.clearHistory()
  }
}

function exportHistory() {
  const data = historyStore.exportHistory()
  const blob = new Blob([data], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `phrase-forge-history-${new Date().toISOString().split('T')[0]}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
</script>

<style scoped>
.history-page {
  min-height: 100vh;
}

.page-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
}

.stats-section {
  margin-bottom: 40px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.stat-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  padding: 30px 20px;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.stat-value {
  font-size: 2.5rem;
  font-weight: 700;
  color: #667eea;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 0.9rem;
  color: #666;
  font-weight: 500;
}

.actions-section {
  margin-bottom: 30px;
}

.actions-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
}

.search-filter {
  display: flex;
  gap: 15px;
  flex: 1;
  max-width: 400px;
}

.search-input,
.filter-select {
  padding: 10px 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: white;
  font-size: 14px;
  flex: 1;
}

.search-input:focus,
.filter-select:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.1);
}

.action-buttons {
  display: flex;
  gap: 10px;
}

.history-section {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.history-actions {
  display: flex;
  align-items: center;
  gap: 15px;
}

.time {
  font-size: 12px;
  color: #6c757d;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #6c757d;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 20px;
}

.empty-state h3 {
  margin: 0 0 10px 0;
  font-size: 1.5rem;
  color: #333;
}

.empty-state p {
  margin: 0 0 20px 0;
  font-size: 1rem;
}

/* 按钮样式 */
.btn-primary,
.btn-secondary,
.btn-danger {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
  display: inline-block;
}

.btn-primary {
  background: #667eea;
  color: white;
}

.btn-primary:hover {
  background: #5a6fd8;
  transform: translateY(-1px);
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background: #5a6268;
}

.btn-danger {
  background: #dc3545;
  color: white;
}

.btn-danger:hover:not(:disabled) {
  background: #c82333;
}

.btn-danger:disabled {
  background: #6c757d;
  cursor: not-allowed;
}

.btn-small {
  padding: 5px 10px;
  font-size: 12px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .actions-bar {
    flex-direction: column;
    align-items: stretch;
    gap: 15px;
  }

  .search-filter {
    max-width: none;
    flex-direction: column;
  }

  .action-buttons {
    display: flex;
    gap: 10px;
  }

  .history-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .history-actions {
    width: 100%;
    justify-content: space-between;
  }

  .keyword-level {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}

@media (max-width: 480px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }

  .page-content {
    padding: 20px 15px;
  }

  .history-section {
    padding: 20px;
  }

  .action-buttons {
    flex-direction: column;
  }

  .history-item {
    padding: 15px;
  }

  .result-details {
    font-size: 14px;
  }
}
</style>
