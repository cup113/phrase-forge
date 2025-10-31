<template>
  <div class="task-item" :class="task.status">
    <div class="task-header">
      <span class="task-keyword">{{ task.keyword }}</span>
      <div class="task-status-container">
        <LoadingSpinner
          v-if="task.status === 'processing'"
          :show="true"
          size="small"
          :center="false"
        />
        <span class="task-status" :class="[task.status, getLevelClass(task.result?.level)]">
          {{ getStatusText(task.status, task.result?.level) }}
        </span>
        <span v-if="task.status === 'processing' && task.startedAt" class="processing-time">
          {{ processingTime }}
        </span>
      </div>
    </div>

    <div v-if="task.status !== 'incomplete'" class="task-sentence">{{ task.sentence }}</div>

    <div v-if="task.scenario && task.status !== 'incomplete'" class="task-scenario">
      场景: {{ task.scenario }}
    </div>

    <div v-if="task.status === 'incomplete'" class="task-incomplete">
      <span class="incomplete-label">待完成</span>
    </div>

    <div v-if="task.error" class="task-error">{{ task.error }}</div>

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
        <div class="action-buttons">
          <button class="btn-action btn-recreate" @click="emit('recreate', task.id)">
            重新造句
          </button>

          <button v-if="canRetry" class="btn-action btn-retry" @click="emit('retry', task.id)">
            重试
          </button>

          <button class="btn-action btn-delete" @click="emit('delete', task.id)">删除</button>
        </div>

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
import type { SentenceMakingTaskCore, TaskBasics } from '@/types'

interface Props {
  task: SentenceMakingTaskCore & TaskBasics
}

interface Emit {
  (event: 'recreate', id: string): void
  (event: 'retry', id: string): void
  (event: 'delete', id: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emit>()

const now = useNow({
  interval: 1000,
})

const processingSeconds = computed(() => {
  if (!props.task.startedAt) {
    return undefined
  }
  const diff = now.value.getTime() - props.task.startedAt
  const seconds = Math.floor(diff / 1000)

  return seconds
})

const processingTime = computed(() => {
  if (processingSeconds.value === undefined) {
    return undefined
  }
  return `${processingSeconds.value.toString().padStart(3, '0')} s`
})

const canRetry = computed(() => {
  const isTimeout = props.task.status === 'processing' && (processingSeconds.value ?? 0) >= 100
  const isFailed = props.task.status === 'failed'
  return isTimeout || isFailed
})

function getStatusText(status: TaskBasics['status'], level?: string): string {
  switch (status) {
    case 'incomplete':
      return '未开始'
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

  const isToday = date.toDateString() === now.toDateString()
  if (isToday) {
    return date.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  const isYesterday = date.toDateString() === yesterday.toDateString()
  if (isYesterday) {
    return (
      '昨天 ' +
      date.toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit',
      })
    )
  }

  const isWithinOneWeek = diff < 7 * 24 * 60 * 60 * 1000
  if (isWithinOneWeek) {
    const days = Math.floor(diff / (24 * 60 * 60 * 1000))
    return `${days}天前`
  }

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
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-sm);
  padding: var(--spacing-md);
  box-shadow: var(--box-shadow-sm);
}

.task-item.processing {
  border-left: 4px solid var(--color-secondary);
}

.task-item.pending {
  border-left: 4px solid var(--color-warning);
}

.task-item.completed {
  border-left: 4px solid var(--color-primary);
}

.task-item.failed {
  border-left: 4px solid var(--color-danger);
}

.task-item.incomplete {
  border-left: 4px solid var(--color-warning);
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-sm);
}

.task-keyword {
  font-weight: 600;
  color: var(--color-text-primary);
}

.task-status-container {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.processing-time {
  font-size: 11px;
  color: var(--color-text-muted);
  background: var(--color-gray-100);
  padding: var(--spacing-xs) var(--spacing-xs);
  border-radius: var(--border-radius);
  border: 1px solid var(--color-border);
}

.task-status {
  font-size: 12px;
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: 12px;
  font-weight: 500;
}

.task-sentence {
  margin-bottom: var(--spacing-sm);
  color: var(--color-gray-700);
  line-height: 1.4;
}

.task-scenario {
  font-size: 12px;
  color: var(--color-text-muted);
  margin-bottom: var(--spacing-sm);
}

.task-incomplete {
  margin-top: var(--spacing-sm);
}

.incomplete-label {
  font-size: 12px;
  color: #856404;
  background: #fff3cd;
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: 12px;
  font-weight: 500;
}

.task-error {
  color: var(--color-danger);
  font-size: 14px;
  margin-top: var(--spacing-sm);
}

.task-result {
  margin-top: var(--spacing-md);
  padding-top: var(--spacing-md);
  border-top: 1px solid var(--color-border);
}

.result-reason {
  margin-bottom: var(--spacing-sm);
  color: var(--color-text-primary);
}

.markdown-content {
  margin-top: var(--spacing-xs);
}

.markdown-content p {
  margin: var(--spacing-xs) 0;
}

.markdown-content ul,
.markdown-content ol {
  margin: var(--spacing-xs) 0;
  padding-left: var(--spacing-xl);
}

.markdown-content li {
  margin-bottom: var(--spacing-xs);
}

.markdown-content strong {
  font-weight: 600;
}

.markdown-content em {
  font-style: italic;
}

.result-suggestions {
  margin-bottom: var(--spacing-sm);
}

.result-suggestions ul {
  margin: var(--spacing-xs) 0;
  padding-left: var(--spacing-xl);
}

.result-suggestions li {
  margin-bottom: var(--spacing-sm);
  color: var(--color-gray-700);
}

.bilingual-suggestion {
  padding-left: var(--spacing-xs);
  margin: var(--spacing-xs) 0;
}

.english-suggestion {
  font-style: italic;
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-xs);
}

.chinese-suggestion {
  color: var(--color-text-secondary);
  font-size: 0.9em;
}

.result-explanation {
  color: var(--color-text-secondary);
}

.task-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: var(--spacing-md);
}

.action-buttons {
  display: flex;
  gap: var(--spacing-md);
}

.task-time {
  font-size: 12px;
  color: var(--color-text-muted);
}

/* 响应式设计 */
@media (max-width: var(--breakpoint-md)) {
  .task-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-sm);
  }

  .task-status-container {
    align-self: flex-start;
  }

  .task-actions {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-sm);
  }
}

@media (max-width: 768px) {
  .task-item {
    padding: var(--spacing-md);
  }

  .task-keyword {
    font-size: 1rem;
  }

  .task-sentence {
    font-size: 0.9rem;
  }

  .result-suggestions ul {
    padding-left: var(--spacing-2xl);
  }
}
</style>
