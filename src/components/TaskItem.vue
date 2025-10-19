<template>
  <div class="task-item" :class="status">
    <div class="task-header">
      <span class="task-keyword">{{ task.keyword }}</span>
      <div class="task-status-container">
        <LoadingSpinner v-if="status === 'processing'" :show="true" size="small" :center="false" />
        <span class="task-status" :class="[status, getLevelClass(task.result?.level)]">
          {{ getStatusText(status, task.result?.level) }}
        </span>
        <span v-if="status === 'processing' && task.startedAt" class="processing-time">
          {{ processingTime }}
        </span>
      </div>
    </div>

    <div class="task-sentence">{{ task.sentence }}</div>

    <div v-if="task.scenario" class="task-scenario">场景: {{ task.scenario }}</div>

    <!-- 错误信息 -->
    <div v-if="task.error" class="task-error">{{ task.error }}</div>

    <!-- 结果展示 -->
    <div v-if="task.result" class="task-result">
      <div class="result-reason">
        <strong>评分理由:</strong>
        <div v-html="renderMarkdown(task.result.reason)" class="markdown-content"></div>
      </div>

      <div
        v-if="task.result.suggestions && task.result.suggestions.length > 0"
        class="result-suggestions"
      >
        <strong>修改建议:</strong>
        <ul>
          <li v-for="(suggestion, index) in task.result.suggestions" :key="index">
            <div v-if="suggestion.includes('||')" class="bilingual-suggestion">
              <div
                class="english-suggestion"
                v-html="renderMarkdown(suggestion.split('||')[0] || '')"
              ></div>
              <div
                class="chinese-suggestion"
                v-html="renderMarkdown(suggestion.split('||')[1] || '')"
              ></div>
            </div>
            <div v-else>{{ suggestion }}</div>
          </li>
        </ul>
      </div>

      <div v-if="task.result.explanation" class="result-explanation">
        <strong>详细解释:</strong>
        <div v-html="renderMarkdown(task.result.explanation)" class="markdown-content"></div>
      </div>
    </div>

    <!-- 操作区域 -->
    <div class="task-actions">
      <slot name="actions">
        <!-- 默认操作区域 -->
        <span v-if="task.completedAt" class="task-time">
          {{ formatTime(task.completedAt) }}
        </span>
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { marked } from 'marked'
import { useNow } from '@vueuse/core'
import { computed } from 'vue'
import LoadingSpinner from './LoadingSpinner.vue'
import type { Task } from '@/types'

interface Props {
  task: Task
  status: Task['status']
}

const props = defineProps<Props>()

const now = useNow({
  interval: 1000,
})

const processingTime = computed(() => {
  if (!props.task.startedAt) {
    return undefined
  }
  const diff = now.value.getTime() - props.task.startedAt
  const seconds = Math.floor(diff / 1000)

  if (seconds < 60) {
    return `${seconds}秒`
  } else {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}分${remainingSeconds}秒`
  }
})

function getStatusText(status: Task['status'], level?: string): string {
  switch (status) {
    case 'pending':
      return '等待中'
    case 'processing':
      return '处理中...'
    case 'completed':
      return level || '已完成'
    case 'failed':
      return '失败'
    default:
      return status
  }
}

function getLevelClass(level?: string): string {
  if (!level) return ''

  if (level.includes('A+') || level.includes('A')) {
    return 'level-excellent'
  } else if (level.includes('B+') || level.includes('B')) {
    return 'level-good'
  } else {
    return 'level-average'
  }
}

function formatTime(timestamp?: number): string {
  if (!timestamp) return ''

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

function renderMarkdown(text: string): string {
  if (!text) return ''
  return marked.parse(text) as string
}
</script>

<style scoped>
.task-item {
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  padding: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.task-item.processing {
  border-left: 4px solid #17a2b8;
}

.task-item.pending {
  border-left: 4px solid #ffc107;
}

.task-item.completed {
  border-left: 4px solid #20c997;
}

.task-item.failed {
  border-left: 4px solid #dc3545;
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.task-keyword {
  font-weight: 600;
  color: #333;
}

.task-status-container {
  display: flex;
  align-items: center;
  gap: 8px;
}

.processing-time {
  font-size: 11px;
  color: #6c757d;
  background: #f8f9fa;
  padding: 2px 6px;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.task-status {
  font-size: 12px;
  padding: 3px 8px;
  border-radius: 12px;
  font-weight: 500;
}

.task-status.pending {
  background: #fff3cd;
  color: #856404;
}

.task-status.processing {
  background: #cce7ff;
  color: #004085;
}

.task-status.completed {
  background: #d4edda;
  color: #155724;
}

.task-status.failed {
  background: #f8d7da;
  color: #721c24;
}

.level-excellent {
  background: #28a745 !important;
  color: white !important;
}

.level-good {
  background: #17a2b8 !important;
  color: white !important;
}

.level-average {
  background: #ffc107 !important;
  color: #212529 !important;
}

.task-sentence {
  margin-bottom: 8px;
  color: #555;
  line-height: 1.4;
}

.task-scenario {
  font-size: 12px;
  color: #6c757d;
  margin-bottom: 8px;
}

.task-error {
  color: #dc3545;
  font-size: 14px;
  margin-top: 8px;
}

.task-result {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid #e9ecef;
}

.result-reason {
  margin-bottom: 8px;
  color: #333;
}

.markdown-content {
  margin-top: 5px;
}

.markdown-content p {
  margin: 5px 0;
}

.markdown-content ul,
.markdown-content ol {
  margin: 5px 0;
  padding-left: 20px;
}

.markdown-content li {
  margin-bottom: 3px;
}

.markdown-content strong {
  font-weight: 600;
}

.markdown-content em {
  font-style: italic;
}

.result-suggestions {
  margin-bottom: 8px;
}

.result-suggestions ul {
  margin: 5px 0;
  padding-left: 20px;
}

.result-suggestions li {
  margin-bottom: 8px;
  color: #555;
}

.bilingual-suggestion {
  padding-left: 4px;
  margin: 4px 0;
}

.english-suggestion {
  font-style: italic;
  color: #333;
  margin-bottom: 3px;
}

.chinese-suggestion {
  color: #666;
  font-size: 0.9em;
}

.result-explanation {
  color: #666;
}

.task-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
}

.task-time {
  font-size: 12px;
  color: #6c757d;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .task-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .task-status-container {
    align-self: flex-start;
  }

  .task-actions {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}

@media (max-width: 480px) {
  .task-item {
    padding: 12px;
  }

  .task-keyword {
    font-size: 1rem;
  }

  .task-sentence {
    font-size: 0.9rem;
  }

  .result-suggestions ul {
    padding-left: 15px;
  }
}
</style>
