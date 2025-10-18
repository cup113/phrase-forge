<template>
  <div class="history-page">
    <header class="page-header">
      <div class="header-content">
        <div class="header-main">
          <h1 class="page-title">学习历史</h1>
          <p class="page-subtitle">查看您的英语学习进度和成果</p>
        </div>
        <nav class="header-nav">
          <router-link to="/" class="nav-link">首页</router-link>
          <router-link to="/history" class="nav-link">学习历史</router-link>
          <router-link to="/settings" class="nav-link">设置</router-link>
        </nav>
      </div>
    </header>

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
          <div v-for="record in filteredHistory" :key="record.id" class="history-item">
            <div class="history-header">
              <div class="keyword-level">
                <span class="keyword">{{ record.keyword }}</span>
                <span class="level" :class="getLevelClass(record.level)">
                  {{ record.level }}
                </span>
              </div>
              <div class="history-actions">
                <span class="time">{{ formatTime(record.createdAt) }}</span>
                <button class="btn-danger btn-small" @click="removeRecord(record.id)">删除</button>
              </div>
            </div>

            <div class="sentence">{{ record.sentence }}</div>

            <div v-if="record.scenario" class="scenario">
              <strong>场景:</strong> {{ record.scenario }}
            </div>

            <div class="result-details">
              <div class="reason"><strong>评分理由:</strong> {{ record.reason }}</div>

              <div v-if="record.suggestions && record.suggestions.length > 0" class="suggestions">
                <strong>修改建议:</strong>
                <ul>
                  <li v-for="(suggestion, index) in record.suggestions" :key="index">
                    {{ suggestion }}
                  </li>
                </ul>
              </div>

              <div v-if="record.explanation" class="explanation">
                <strong>详细解释:</strong> {{ record.explanation }}
              </div>
            </div>
          </div>
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
import { ref, computed, onMounted } from 'vue'
import { useHistoryStore } from '@/stores/history'
import ProgressStats from '@/components/ProgressStats.vue'
import type { HistoryRecord } from '@/stores/history'

const historyStore = useHistoryStore()

const searchKeyword = ref('')
const filterLevel = ref('')

const history = computed(() => historyStore.recentHistory)

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
    filtered = filtered.filter((record) => record.level === filterLevel.value)
  }

  return filtered
})

const totalRecords = computed(() => history.value.length)

const uniqueKeywords = computed(() => {
  const keywords = new Set(history.value.map((record) => record.keyword))
  return keywords.size
})

const averageLevel = computed(() => {
  if (history.value.length === 0) return 'N/A'

  const levelScores: Record<string, number> = {
    'A+': 6,
    A: 5,
    'B+': 4,
    B: 3,
    'C+': 2,
    C: 1,
  }

  const totalScore = history.value.reduce((sum, record) => {
    return sum + (levelScores[record.level] || 0)
  }, 0)

  const averageScore = totalScore / history.value.length

  // 将分数映射回等级
  if (averageScore >= 5.5) return 'A+'
  if (averageScore >= 4.5) return 'A'
  if (averageScore >= 3.5) return 'B+'
  if (averageScore >= 2.5) return 'B'
  if (averageScore >= 1.5) return 'C+'
  return 'C'
})

const recentActivity = computed(() => {
  const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
  return history.value.filter((record) => record.createdAt > oneWeekAgo).length
})

onMounted(() => {
  historyStore.loadHistoryFromStorage()
})

function getLevelClass(level: string): string {
  if (level.includes('A+') || level.includes('A')) {
    return 'level-excellent'
  } else if (level.includes('B+') || level.includes('B')) {
    return 'level-good'
  } else {
    return 'level-average'
  }
}

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

.page-header {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  padding: 20px 0;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-main {
  text-align: left;
}

.header-nav {
  display: flex;
  gap: 20px;
}

.nav-link {
  color: #333;
  text-decoration: none;
  font-weight: 500;
  padding: 8px 16px;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.nav-link:hover,
.nav-link.router-link-active {
  background: rgba(32, 201, 151, 0.1);
  color: #20c997;
}

.page-title {
  margin: 0;
  font-size: 2.5rem;
  font-weight: 700;
  color: #333;
  background: linear-gradient(135deg, #20c997, #17a2b8);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.page-subtitle {
  margin: 10px 0 0 0;
  font-size: 1.1rem;
  color: #666;
  font-weight: 300;
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

.history-item {
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
}

.history-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.keyword-level {
  display: flex;
  align-items: center;
  gap: 15px;
}

.keyword {
  font-size: 1.2rem;
  font-weight: 600;
  color: #333;
}

.level {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.level-excellent {
  background: #28a745;
  color: white;
}

.level-good {
  background: #17a2b8;
  color: white;
}

.level-average {
  background: #ffc107;
  color: #212529;
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

.sentence {
  font-size: 1.1rem;
  color: #555;
  line-height: 1.5;
  margin-bottom: 10px;
  font-style: italic;
}

.scenario {
  font-size: 14px;
  color: #6c757d;
  margin-bottom: 15px;
}

.result-details {
  border-top: 1px solid #e9ecef;
  padding-top: 15px;
}

.reason,
.suggestions,
.explanation {
  margin-bottom: 10px;
  color: #555;
  line-height: 1.5;
}

.suggestions ul {
  margin: 5px 0;
  padding-left: 20px;
}

.suggestions li {
  margin-bottom: 3px;
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
  .page-title {
    font-size: 2rem;
  }

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
