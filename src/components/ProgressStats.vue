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

      <div class="stat-item">
        <div class="stat-icon">🔢</div>
        <div class="stat-info">
          <div class="stat-value">{{ totalTokens }}</div>
          <div class="stat-label">总 Token</div>
        </div>
      </div>

      <div class="stat-item">
        <div class="stat-icon">💬</div>
        <div class="stat-info">
          <div class="stat-value">{{ averageTokens }}</div>
          <div class="stat-label">平均 Token</div>
        </div>
      </div>
    </div>

    <!-- 等级分布图表 -->
    <div class="level-distribution">
      <h4>等级分布</h4>
      <div class="distribution-chart">
        <div
          v-for="level in levelDistribution"
          class="level-bar"
          :key="level.level"
          :style="{ width: level.percentage + '%' }"
          :class="[getLevelClass(level.level), level.count === 0 ? 'hidden' : 'non-hidden']"
        >
          <span class="level-label">{{ level.level }}</span>
          <span class="level-count">{{ level.count }}</span>
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
import { isSentenceMakingTask } from '@/types'
import type { Task } from '@/types'

const historyStore = useHistoryStore()

const history = computed(() => historyStore.history)

// 基础统计
const totalRecords = computed(() => history.value.length)

const uniqueKeywords = computed(() => {
  const keywords = new Set(
    history.value.filter(isSentenceMakingTask).map((record) => record.keyword),
  )
  return keywords.size
})

const averageLevel = computed(() => {
  const sentenceMakingHistory = history.value.filter(isSentenceMakingTask)
  if (sentenceMakingHistory.length === 0) return 'N/A'

  const levelScores: Record<string, number> = {
    'A+': 6,
    A: 5,
    'B+': 4,
    B: 3,
    'C+': 2,
    C: 1,
  }

  const totalScore = sentenceMakingHistory.reduce((sum, record) => {
    return sum + (levelScores[record.result?.level || ''] || 0)
  }, 0)

  const averageScore = totalScore / sentenceMakingHistory.length

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

function get_usage(record: Task) {
  const usage = record.result?.usage
  if (usage === undefined) {
    return {
      input: 0,
      output: 0,
    }
  } else if (Array.isArray(usage)) {
    return {
      input: usage.reduce((acc, rec) => acc + rec.inputTokens, 0),
      output: usage.reduce((acc, rec) => acc + rec.outputTokens, 0),
    }
  } else {
    return {
      input: usage.inputTokens,
      output: usage.outputTokens,
    }
  }
}

const totalTokensRaw = computed(() => {
  return history.value.reduce((sum, record) => {
    const { input, output } = get_usage(record)
    return sum + input + output
  }, 0)
})

// Token 统计
const totalTokens = computed(() => {
  if (totalTokensRaw.value >= 1000) {
    return (totalTokensRaw.value / 1000).toFixed(1) + 'K'
  }
  return totalTokensRaw.value.toString()
})

const averageTokens = computed(() => {
  if (totalTokensRaw.value > 0) {
    const avg = totalTokensRaw.value / totalRecords.value
    if (avg >= 1000) {
      return (avg / 1000).toFixed(1) + 'K'
    }
    return avg.toFixed(0)
  }
  return 'N/A'
})

// 等级分布
const levelDistribution = computed(() => {
  const levels = ['A+', 'A', 'B+', 'B', 'C+', 'C']
  const distribution: { level: string; count: number; percentage: number }[] = []

  const sentenceMakingHistory = history.value.filter(isSentenceMakingTask)

  levels.forEach((level) => {
    const count = sentenceMakingHistory.filter((record) => record.result?.level === level).length
    const percentage =
      sentenceMakingHistory.length > 0 ? (count / sentenceMakingHistory.length) * 100 : 0
    distribution.push({ level, count, percentage })
  })

  return distribution
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
      (record) => record.createdAt >= dayStart && record.createdAt <= dayEnd,
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
  background: var(--color-surface);
  backdrop-filter: blur(10px);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-2xl);
  box-shadow: var(--box-shadow);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.progress-stats h3 {
  margin: 0 0 var(--spacing-2xl) 0;
  color: var(--color-text-primary);
  font-size: 1.5rem;
  font-weight: 600;
  text-align: center;
}

.progress-stats h4 {
  margin: 0 0 var(--spacing-2xl) 0;
  color: var(--color-gray-700);
  font-size: 1.1rem;
  font-weight: 500;
}

/* 统计概览 */
.stats-overview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: var(--spacing-xl);
  margin-bottom: var(--spacing-3xl);
}

.stat-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-2xl);
  padding: var(--spacing-2xl);
  background: white;
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow-sm);
}

.stat-icon {
  font-size: 1.5rem;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(32, 201, 151, 0.1);
  border-radius: var(--border-radius);
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-primary);
  line-height: 1;
}

.stat-label {
  font-size: 0.85rem;
  color: var(--color-text-secondary);
  margin-top: var(--spacing-xs);
}

/* 等级分布 */
.level-distribution {
  margin-bottom: var(--spacing-3xl);
}

.distribution-chart {
  display: flex;
  height: 40px;
  background: var(--color-gray-100);
  border-radius: var(--border-radius);
  overflow: hidden;
}

.level-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  transition: var(--transition-slow);
  transform: scale(1);
  min-width: 40px;
}

.level-bar:hover {
  transform: scale(1.05);
  z-index: 1;
}

.level-bar.hidden {
  display: none;
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
  color: var(--color-text-secondary);
  font-weight: 500;
}

/* 学习趋势 */
.learning-trend {
  margin-bottom: 0;
}

.trend-chart {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  height: 240px;
  padding: var(--spacing-md) 0;
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
  background: linear-gradient(to top, var(--color-primary), var(--color-secondary));
  border-radius: var(--border-radius-sm) var(--border-radius-sm) 0 0;
  transition: var(--transition-slow);
  min-height: 4px;
}

.trend-day:hover .trend-bar {
  background: linear-gradient(to top, #1db489, #148ea0);
  transform: scale(1.1);
}

.trend-label {
  margin-top: var(--spacing-sm);
  font-size: 12px;
  color: var(--color-text-secondary);
  font-weight: 500;
}

.trend-count {
  font-size: 10px;
  color: var(--color-text-muted);
  margin-top: var(--spacing-xs);
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
    padding: var(--spacing-xl);
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
