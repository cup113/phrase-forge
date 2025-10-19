<template>
  <div class="progress-stats">
    <h3>学习进度统计</h3>

    <!-- 核心统计指标 -->
    <div class="stats-overview">
      <div class="stat-item">
        <div class="stat-icon">📚</div>
        <div class="stat-info">
          <div class="stat-value">{{ totalRecords }}</div>
          <div class="stat-label">总练习次数</div>
        </div>
      </div>

      <div class="stat-item">
        <div class="stat-icon">🔤</div>
        <div class="stat-info">
          <div class="stat-value">{{ uniqueKeywords }}</div>
          <div class="stat-label">学习词汇数</div>
        </div>
      </div>

      <div class="stat-item">
        <div class="stat-icon">⭐</div>
        <div class="stat-info">
          <div class="stat-value">{{ averageLevel }}</div>
          <div class="stat-label">平均评分</div>
        </div>
      </div>

      <div class="stat-item">
        <div class="stat-icon">📈</div>
        <div class="stat-info">
          <div class="stat-value">{{ recentActivity }}</div>
          <div class="stat-label">最近7天</div>
        </div>
      </div>
    </div>

    <!-- 等级分布图表 -->
    <div class="level-distribution">
      <h4>等级分布</h4>
      <div class="distribution-chart">
        <div
          v-for="level in levelDistribution"
          :key="level.level"
          class="level-bar"
          :style="{ width: level.percentage + '%' }"
          :class="getLevelClass(level.level)"
        >
          <span class="level-label">{{ level.level }}</span>
          <span class="level-count">{{ level.count }}</span>
        </div>
      </div>
    </div>

    <!-- 热门词汇 -->
    <div class="popular-keywords">
      <h4>热门词汇</h4>
      <div class="keywords-list">
        <div v-for="keyword in topKeywords" :key="keyword.keyword" class="keyword-item">
          <span class="keyword-text">{{ keyword.keyword }}</span>
          <span class="keyword-count">{{ keyword.count }}次</span>
        </div>
      </div>
    </div>

    <!-- 学习趋势 -->
    <div class="learning-trend">
      <h4>学习趋势</h4>
      <div class="trend-chart">
        <div v-for="day in weeklyTrend" :key="day.date" class="trend-day">
          <div class="trend-bar" :style="{ height: day.height + 'px' }"></div>
          <div class="trend-label">{{ day.label }}</div>
          <div class="trend-count">{{ day.count }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useHistoryStore } from '@/stores/history'
import type { HistoryRecord } from '@/types'

const historyStore = useHistoryStore()

const history = computed(() => historyStore.history)

// 基础统计
const totalRecords = computed(() => history.value.length)

const uniqueKeywords = computed(() => {
  const keywords = new Set(history.value.map((record: HistoryRecord) => record.keyword))
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

  const totalScore = history.value.reduce((sum: number, record: HistoryRecord) => {
    return sum + (levelScores[record.result?.level || ''] || 0)
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
  return history.value.filter((record: HistoryRecord) => record.createdAt > oneWeekAgo).length
})

// 等级分布
const levelDistribution = computed(() => {
  const levels = ['A+', 'A', 'B+', 'B', 'C+', 'C']
  const distribution: { level: string; count: number; percentage: number }[] = []

  levels.forEach((level) => {
    const count = history.value.filter(
      (record: HistoryRecord) => record.result?.level === level,
    ).length
    const percentage = totalRecords.value > 0 ? (count / totalRecords.value) * 100 : 0
    distribution.push({ level, count, percentage })
  })

  return distribution
})

// 热门词汇
const topKeywords = computed(() => {
  const keywordCounts: Record<string, number> = {}

  history.value.forEach((record: HistoryRecord) => {
    const keyword = record.keyword
    keywordCounts[keyword] = (keywordCounts[keyword] || 0) + 1
  })

  return Object.entries(keywordCounts)
    .map(([keyword, count]) => ({ keyword, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8)
})

// 学习趋势（最近7天）
const weeklyTrend = computed(() => {
  const days = []
  const now = new Date()

  for (let i = 6; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)

    const dayStart = new Date(date).setHours(0, 0, 0, 0)
    const dayEnd = new Date(date).setHours(23, 59, 59, 999)

    const count = history.value.filter(
      (record: HistoryRecord) => record.createdAt >= dayStart && record.createdAt <= dayEnd,
    ).length

    const maxCount = Math.max(...(weeklyTrend.value?.map((d) => d.count) || [1]), 1)
    const height = (count / maxCount) * 20 + count * 5

    days.push({
      date: date.toISOString().split('T')[0],
      label: date.toLocaleDateString('zh-CN', { weekday: 'short' }),
      count,
      height,
    })
  }

  return days
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
</script>

<style scoped>
.progress-stats {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.progress-stats h3 {
  margin: 0 0 25px 0;
  color: #333;
  font-size: 1.5rem;
  font-weight: 600;
  text-align: center;
}

.progress-stats h4 {
  margin: 0 0 15px 0;
  color: #555;
  font-size: 1.1rem;
  font-weight: 500;
}

/* 统计概览 */
.stats-overview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.stat-icon {
  font-size: 1.5rem;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(32, 201, 151, 0.1);
  border-radius: 8px;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #20c997;
  line-height: 1;
}

.stat-label {
  font-size: 0.85rem;
  color: #666;
  margin-top: 4px;
}

/* 等级分布 */
.level-distribution {
  margin-bottom: 30px;
}

.distribution-chart {
  display: flex;
  height: 40px;
  background: #f8f9fa;
  border-radius: 8px;
  overflow: hidden;
}

.level-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  transition: all 0.3s ease;
  min-width: 40px;
}

.level-bar:hover {
  transform: scale(1.05);
  z-index: 1;
}

.level-excellent {
  background: linear-gradient(135deg, #28a745, #20c997);
}

.level-good {
  background: linear-gradient(135deg, #17a2b8, #6f42c1);
}

.level-average {
  background: linear-gradient(135deg, #ffc107, #fd7e14);
}

.level-label {
  color: white;
  font-size: 12px;
  font-weight: 600;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.level-count {
  position: absolute;
  top: -20px;
  font-size: 10px;
  color: #666;
  font-weight: 500;
}

/* 热门词汇 */
.popular-keywords {
  margin-bottom: 30px;
}

.keywords-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 10px;
}

.keyword-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  font-size: 14px;
  transition: all 0.2s ease;
}

.keyword-item:hover {
  border-color: #667eea;
  box-shadow: 0 2px 6px rgba(102, 126, 234, 0.2);
}

.keyword-text {
  font-weight: 500;
  color: #333;
}

.keyword-count {
  color: #6c757d;
  font-size: 12px;
}

/* 学习趋势 */
.learning-trend {
  margin-bottom: 0;
}

.trend-chart {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  height: 120px;
  padding: 10px 0;
}

.trend-day {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  text-align: center;
}

.trend-bar {
  width: 20px;
  background: linear-gradient(to top, #20c997, #17a2b8);
  border-radius: 4px 4px 0 0;
  transition: all 0.3s ease;
  min-height: 4px;
}

.trend-day:hover .trend-bar {
  background: linear-gradient(to top, #1db489, #148ea0);
  transform: scale(1.1);
}

.trend-label {
  margin-top: 8px;
  font-size: 12px;
  color: #666;
  font-weight: 500;
}

.trend-count {
  font-size: 10px;
  color: #999;
  margin-top: 2px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .stats-overview {
    grid-template-columns: repeat(2, 1fr);
  }

  .keywords-list {
    grid-template-columns: repeat(2, 1fr);
  }

  .progress-stats {
    padding: 20px;
  }
}

@media (max-width: 480px) {
  .stats-overview {
    grid-template-columns: 1fr;
  }

  .keywords-list {
    grid-template-columns: 1fr;
  }

  .trend-chart {
    height: 100px;
  }

  .trend-bar {
    width: 15px;
  }
}
</style>
