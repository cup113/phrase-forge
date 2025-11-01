<template>
  <div class="task-item" :class="task.status">
    <div class="task-header">
      <span class="task-keyword">{{ getTaskTitle(task) }}</span>
      <div class="task-status-container">
        <LoadingSpinner
          v-if="task.status === 'processing'"
          :show="true"
          size="small"
          :center="false"
        />
        <span class="task-status" :class="[task.status, getLevelClass(getTaskLevel(task))]">
          {{ getStatusText(task.status, getTaskLevel(task)) }}
        </span>
        <span v-if="task.status === 'processing' && task.startedAt" class="processing-time">
          {{ processingTime }}
        </span>
      </div>
    </div>

    <!-- 句子制作任务内容 -->
    <div v-if="isSentenceMakingTask(task) && task.status !== 'incomplete'" class="task-sentence">
      {{ task.sentence }}
    </div>
    <div
      v-if="isSentenceMakingTask(task) && task.scenario && task.status !== 'incomplete'"
      class="task-scenario"
    >
      场景: {{ task.scenario }}
    </div>

    <!-- 翻译对照任务内容 -->
    <div
      v-if="isTranslationComparisonTask(task) && task.status !== 'incomplete'"
      class="task-translation"
    >
      <div class="translation-card">
        <div class="translation-header">
          <span class="translation-label">原文</span>
          <div class="translation-original">{{ task.original }}</div>
        </div>
        <div class="translation-options">
          <span class="translation-label">翻译选项</span>
          <div>
            <span v-for="(options, index) in task.translations" :key="index" class="option-chip">
              {{ options.join(' / ') }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- 概要标准制定任务内容 -->
    <div
      v-if="isSummaryStandardTask(task) && task.status !== 'incomplete'"
      class="task-summary-standard"
    >
      <div class="summary-card">
        <div class="summary-header">
          <span class="summary-label">原文</span>
          <div class="summary-passage">{{ task.passage }}</div>
        </div>
      </div>
    </div>

    <!-- 概要评分任务内容 -->
    <div
      v-if="isSummaryEvaluationTask(task) && task.status !== 'incomplete'"
      class="task-summary-evaluation"
    >
      <div class="summary-card">
        <div class="summary-header">
          <span class="summary-label">原文</span>
          <div class="summary-passage">{{ task.passage }}</div>
        </div>
        <div class="summary-content">
          <span class="summary-label">学生摘要</span>
          <div class="summary-text">{{ task.summary }}</div>
        </div>
      </div>
    </div>

    <div v-if="task.status === 'incomplete'" class="task-incomplete">
      <span class="incomplete-label">待完成</span>
    </div>

    <div v-if="task.error" class="task-error">{{ task.error }}</div>

    <!-- 句子制作任务结果 -->
    <div v-if="isSentenceMakingTask(task) && task.result" class="task-result">
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

    <!-- 翻译对照任务结果 -->
    <div v-if="isTranslationComparisonTask(task) && task.result" class="task-result">
      <div v-if="task.result.options && task.result.options.length > 0" class="result-options">
        <strong>选项评估:</strong>
        <div>
          <div v-for="(option, index) in task.result.options" :key="index" class="option-card">
            <div class="option-header">
              <span class="option-level" :class="getLevelClass(option.level)"
                >{{ option.level }}
              </span>
              <span class="option-text">{{ option.text }}</span>
            </div>
            <div class="option-reason" v-if="option.reason.length >= 2">{{ option.reason }}</div>
            <div class="option-example" v-if="option.example.length >= 2">
              <span class="example-label">示例:</span>
              {{ option.example }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 概要标准制定任务结果 -->
    <div v-if="isSummaryStandardTask(task) && task.result" class="task-result">
      <div class="result-standard">
        <strong>评分标准:</strong>
        <div v-html="renderMarkdown(task.result.standard)" class="markdown-content"></div>
      </div>
    </div>

    <!-- 概要评分任务结果 -->
    <div v-if="isSummaryEvaluationTask(task) && task.result" class="task-result">
      <div class="result-summary-evaluation">
        <div class="score-summary">
          <strong>总分: {{ task.result.total }}/{{ task.result.full }}</strong>
          <div class="score-breakdown">
            <div class="score-item">
              <span class="score-label">内容分:</span>
              <span class="score-value">{{
                task.result.contentBasic + task.result.contentAddition
              }}</span>
            </div>
            <div class="score-item">
              <span class="score-label">语言分:</span>
              <span class="score-value">{{ task.result.languageBonus }}</span>
            </div>
            <div class="score-item">
              <span class="score-label">字数扣分:</span>
              <span class="score-value">{{ task.result.wordLimitPenalty }}</span>
            </div>
          </div>
        </div>

        <div v-if="task.result.contentReasons.length > 0" class="content-reasons">
          <strong>内容评分理由:</strong>
          <ul>
            <li v-for="(reason, index) in task.result.contentReasons" :key="index">
              {{ reason }}
            </li>
          </ul>
        </div>

        <div v-if="task.result.languageReasons.length > 0" class="language-reasons">
          <strong>语言评分理由:</strong>
          <ul>
            <li v-for="(reason, index) in task.result.languageReasons" :key="index">
              {{ reason }}
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- 操作区域 -->
    <div class="task-actions">
      <slot name="actions">
        <!-- 默认操作区域 -->
        <div class="action-buttons">
          <button
            v-if="task.type === 'sentence-making'"
            class="btn-action btn-recreate"
            @click="emit('recreate', task.id)"
          >
            重新造句
          </button>

          <button
            v-if="task.type === 'summary-standard'"
            class="btn-action btn-evaluate"
            @click="emit('navigateToEvaluation', task.id)"
          >
            前往评分
          </button>

          <button
            v-if="task.type === 'summary-evaluation'"
            class="btn-action btn-rewrite"
            @click="emit('rewriteSummary', task.id)"
          >
            重写
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
import type { Task, TaskBasics } from '@/types'
import {
  isSentenceMakingTask,
  isTranslationComparisonTask,
  isSummaryStandardTask,
  isSummaryEvaluationTask,
} from '@/types'

interface Props {
  task: Task
}

interface Emit {
  (event: 'recreate', id: string): void
  (event: 'retry', id: string): void
  (event: 'delete', id: string): void
  (event: 'navigateToEvaluation', id: string): void
  (event: 'rewriteSummary', id: string): void
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

function getTaskTitle(task: Task): string {
  if (isSentenceMakingTask(task)) {
    return task.keyword
  }
  if (isTranslationComparisonTask(task)) {
    return '翻译对照'
  }
  if (isSummaryStandardTask(task)) {
    return '概要标准制定'
  }
  if (isSummaryEvaluationTask(task)) {
    return '概要评分'
  }
  return '未知任务'
}

function getTaskLevel(task: Task): string | undefined {
  if (isSentenceMakingTask(task) && task.result) {
    return task.result.level
  }
  if (isSummaryEvaluationTask(task) && task.result) {
    return `${task.result.total}/${task.result.full}`
  }
  return undefined
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
  transition: var(--transition);
}

.task-item.processing {
  border-left: 4px solid var(--color-secondary);
  background: linear-gradient(135deg, rgba(23, 162, 184, 0.05) 0%, white 100%);
}

.task-item.pending {
  border-left: 4px solid var(--color-warning);
  background: linear-gradient(135deg, rgba(255, 193, 7, 0.05) 0%, white 100%);
}

.task-item.completed {
  border-left: 4px solid var(--color-primary);
  background: linear-gradient(135deg, rgba(32, 201, 151, 0.05) 0%, white 100%);
}

.task-item.failed {
  border-left: 4px solid var(--color-danger);
  background: linear-gradient(135deg, rgba(220, 53, 69, 0.05) 0%, white 100%);
}

.task-item.incomplete {
  border-left: 4px solid var(--color-warning);
  background: linear-gradient(135deg, rgba(255, 193, 7, 0.05) 0%, white 100%);
}

.task-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
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
  transition: var(--transition);
}

.task-status.pending {
  background: var(--color-warning-light);
  color: var(--color-warning);
  border: 1px solid var(--color-warning);
}

.task-status.processing {
  background: var(--color-secondary);
  color: white;
}

.task-status.completed {
  background: var(--color-primary);
  color: white;
}

.task-status.failed {
  background: var(--color-danger);
  color: white;
}

.task-status.incomplete {
  background: var(--color-warning-light);
  color: var(--color-warning);
  border: 1px solid var(--color-warning);
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

/* 翻译对照任务样式 */
.task-translation {
  margin-bottom: var(--spacing-sm);
}

.translation-card {
  background: var(--color-gray-50);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-sm);
  padding: var(--spacing-md);
  transition: var(--transition);
}

.translation-card:hover {
  box-shadow: var(--box-shadow-sm);
  transform: translateY(-1px);
}

.translation-header {
  margin-bottom: var(--spacing-md);
}

.translation-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: var(--spacing-xs);
  display: block;
}

.translation-original {
  font-size: 14px;
  color: var(--color-text-primary);
  line-height: 1.5;
  padding: var(--spacing-sm);
  background: white;
  border-radius: var(--border-radius-sm);
  border-left: 3px solid var(--color-primary);
}

.translation-options {
  margin-top: var(--spacing-md);
}

.option-chip {
  display: inline-block;
  background: white;
  border: 1px solid var(--color-border);
  border-radius: 16px;
  padding: var(--spacing-xs) var(--spacing-sm);
  margin-right: var(--spacing-sm);
  margin-bottom: var(--spacing-sm);
  font-size: 12px;
  color: var(--color-text-secondary);
  transition: var(--transition);
}

.option-chip:hover {
  background: var(--color-primary);
  color: white;
  transform: translateY(-1px);
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
  padding: var(--spacing-sm);
  background: var(--color-danger-light);
  border: 1px solid var(--color-danger);
  border-radius: var(--border-radius-sm);
  border-left: 4px solid var(--color-danger);
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

.option-card {
  background: var(--color-gray-50);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-sm);
  padding: var(--spacing-md);
  transition: all 0.2s ease;
}

.option-card:hover {
  box-shadow: var(--box-shadow-sm);
  transform: translateY(-1px);
}

.option-card.level-excellent {
  border-left: 4px solid var(--color-success);
  background: linear-gradient(135deg, var(--color-success-light) 0%, var(--color-gray-50) 100%);
}

.option-card.level-good {
  border-left: 4px solid var(--color-warning);
  background: linear-gradient(135deg, var(--color-warning-light) 0%, var(--color-gray-50) 100%);
}

.option-card.level-average {
  border-left: 4px solid var(--color-danger);
  background: linear-gradient(135deg, var(--color-danger-light) 0%, var(--color-gray-50) 100%);
}

.option-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-sm);
}

.option-level {
  font-size: 12px;
  font-weight: 600;
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: 12px;
  color: white;
  min-width: 40px;
  text-align: center;
}

.option-card.level-excellent .option-level {
  background: var(--color-success);
}

.option-card.level-good .option-level {
  background: var(--color-warning);
}

.option-card.level-average .option-level {
  background: var(--color-danger);
}

.option-text {
  font-weight: 600;
  color: var(--color-text-primary);
  flex: 1;
}

.option-reason {
  color: var(--color-text-secondary);
  font-size: 0.9em;
  line-height: 1.4;
  margin-bottom: var(--spacing-sm);
}

.option-example {
  font-size: 0.85em;
  color: var(--color-text-muted);
  padding: var(--spacing-sm);
  background: rgba(255, 255, 255, 0.7);
  border-radius: var(--border-radius-sm);
  border-left: 3px solid var(--color-border);
}

.example-label {
  font-weight: 600;
  color: var(--color-text-primary);
  margin-right: var(--spacing-xs);
}

/* 概要任务样式 */
.task-summary-standard,
.task-summary-evaluation {
  margin-bottom: var(--spacing-sm);
}

.summary-card {
  background: var(--color-gray-50);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-sm);
  padding: var(--spacing-md);
  transition: var(--transition);
}

.summary-card:hover {
  box-shadow: var(--box-shadow-sm);
  transform: translateY(-1px);
}

.summary-header,
.summary-content {
  margin-bottom: var(--spacing-md);
}

.summary-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: var(--spacing-xs);
  display: block;
}

.summary-passage,
.summary-text {
  font-size: 14px;
  color: var(--color-text-primary);
  line-height: 1.5;
  padding: var(--spacing-sm);
  background: white;
  border-radius: var(--border-radius-sm);
  border-left: 3px solid var(--color-primary);
}

/* 概要评分结果样式 */
.result-standard {
  margin-bottom: var(--spacing-sm);
  color: var(--color-text-primary);
}

.result-summary-evaluation {
  margin-bottom: var(--spacing-sm);
}

.score-summary {
  margin-bottom: var(--spacing-md);
  padding: var(--spacing-md);
  background: var(--color-gray-50);
  border-radius: var(--border-radius-sm);
  border-left: 4px solid var(--color-primary);
}

.score-breakdown {
  display: flex;
  gap: var(--spacing-lg);
  margin-top: var(--spacing-sm);
  flex-wrap: wrap;
}

.score-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.score-label {
  font-size: 12px;
  color: var(--color-text-muted);
}

.score-value {
  font-weight: 600;
  color: var(--color-text-primary);
}

.content-reasons,
.language-reasons {
  margin-bottom: var(--spacing-sm);
}

.content-reasons ul,
.language-reasons ul {
  margin: var(--spacing-xs) 0;
  padding-left: var(--spacing-xl);
}

.content-reasons li,
.language-reasons li {
  margin-bottom: var(--spacing-xs);
  color: var(--color-gray-700);
}

.task-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: var(--spacing-md);
}

.action-buttons {
  display: flex;
  gap: var(--spacing-sm);
}

.btn-action {
  padding: var(--spacing-xs) var(--spacing-md);
  font-size: 11px;
  border: none;
  border-radius: var(--border-radius-sm);
  cursor: pointer;
  font-weight: 500;
  transition: var(--transition);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  min-width: 60px;
}

.btn-recreate {
  background: var(--color-secondary);
  color: white;
}

.btn-recreate:hover {
  background: #138496;
  transform: translateY(-1px);
  box-shadow: 0 2px 6px rgba(23, 162, 184, 0.3);
}

.btn-evaluate {
  background: var(--color-success);
  color: white;
}

.btn-evaluate:hover {
  background: #1e7e34;
  transform: translateY(-1px);
  box-shadow: 0 2px 6px rgba(40, 167, 69, 0.3);
}

.btn-rewrite {
  background: var(--color-warning);
  color: var(--color-gray-900);
}

.btn-rewrite:hover {
  background: #e0a800;
  transform: translateY(-1px);
  box-shadow: 0 2px 6px rgba(255, 193, 7, 0.3);
}

.btn-retry {
  background: var(--color-warning);
  color: var(--color-gray-900);
}

.btn-retry:hover {
  background: #e0a800;
  transform: translateY(-1px);
  box-shadow: 0 2px 6px rgba(255, 193, 7, 0.3);
}

.btn-delete {
  background: var(--color-danger);
  color: white;
}

.btn-delete:hover {
  background: #c82333;
  transform: translateY(-1px);
  box-shadow: 0 2px 6px rgba(220, 53, 69, 0.3);
}

.task-time {
  font-size: 12px;
  color: var(--color-text-muted);
  font-weight: 500;
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

  .action-buttons {
    flex-wrap: wrap;
    gap: var(--spacing-xs);
  }

  .btn-action {
    font-size: 10px;
    min-width: 50px;
    padding: var(--spacing-xs) var(--spacing-sm);
  }

  .translation-card {
    padding: var(--spacing-sm);
  }

  .option-chip {
    font-size: 11px;
    margin-right: var(--spacing-xs);
    margin-bottom: var(--spacing-xs);
  }

  .option-card {
    padding: var(--spacing-sm);
  }

  .option-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-xs);
  }

  .option-level {
    align-self: flex-start;
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

  .bilingual-suggestion {
    padding-left: 0;
  }

  .english-suggestion,
  .chinese-suggestion {
    font-size: 0.85em;
  }
}

@media (max-width: var(--breakpoint-sm)) {
  .task-item {
    padding: var(--spacing-sm);
    margin-bottom: var(--spacing-sm);
  }

  .task-keyword {
    font-size: 0.9rem;
  }

  .task-sentence {
    font-size: 0.85rem;
  }

  .task-status {
    font-size: 11px;
  }

  .processing-time {
    font-size: 10px;
  }

  .result-suggestions ul {
    padding-left: var(--spacing-xl);
  }

  .markdown-content ul,
  .markdown-content ol {
    padding-left: var(--spacing-lg);
  }
}
</style>
