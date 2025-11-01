<template>
  <div class="summary-form">
    <div class="form-header">
      <div class="form-icon">📋</div>
      <div class="form-title">
        <h2>概要写作</h2>
        <p>输入文章和摘要，获取AI评估和改进建议</p>
      </div>
    </div>

    <!-- API Key 配置警告 -->
    <div v-if="!apiConfigStore.isConfigured" class="api-warning">
      <div class="warning-icon">⚠️</div>
      <div class="warning-content">
        <strong>API Key 未配置</strong>
        <p>请先配置 API Key 才能使用评估功能</p>
        <RouterLink to="/settings" class="warning-link"> 前往设置页面配置 </RouterLink>
      </div>
    </div>

    <form @submit.prevent="submitSummary" class="summary-input-form">
      <!-- 任务类型选择 -->
      <div class="form-group">
        <label for="task-type">
          <span class="label-icon">🎯</span>
          任务类型
        </label>
        <div class="radio-group">
          <label class="radio-label">
            <input type="radio" v-model="taskType" value="summary-standard" class="radio-input" />
            <span class="radio-custom"></span>
            <span class="radio-text">
              <strong>标准制定</strong>
              <small>为文章制定评分标准</small>
            </span>
          </label>
          <label class="radio-label">
            <input type="radio" v-model="taskType" value="summary-evaluation" class="radio-input" />
            <span class="radio-custom"></span>
            <span class="radio-text">
              <strong>摘要评分</strong>
              <small>根据标准评估摘要质量</small>
            </span>
          </label>
        </div>
      </div>

      <!-- 文章输入 -->
      <div class="form-group">
        <label for="passage">
          <span class="label-icon">📖</span>
          原文
        </label>
        <textarea
          id="passage"
          v-model="passage"
          placeholder="请输入要总结的英文文章"
          rows="6"
          required
        ></textarea>
      </div>

      <!-- 摘要输入 - 标准制定模式 -->
      <div v-if="taskType === 'summary-standard'" class="form-group">
        <label for="summary">
          <span class="label-icon">📝</span>
          参考摘要
          <span class="label-hint">（可选）</span>
        </label>
        <textarea
          id="summary"
          v-model="summary"
          placeholder="请输入参考摘要（可选）"
          rows="4"
        ></textarea>
      </div>

      <!-- 摘要输入 - 评分模式 -->
      <div v-if="taskType === 'summary-evaluation'" class="form-group">
        <label for="summary">
          <span class="label-icon">📝</span>
          待评估摘要
        </label>
        <textarea
          id="summary"
          v-model="summary"
          placeholder="请输入待评估的摘要"
          rows="4"
          required
        ></textarea>
      </div>

      <!-- 评分标准输入 - 仅评分模式 -->
      <div v-if="taskType === 'summary-evaluation'" class="form-group">
        <label for="standard">
          <span class="label-icon">📊</span>
          评分标准
        </label>
        <textarea
          id="standard"
          v-model="standard"
          placeholder="请输入评分标准"
          required
          rows="3"
        ></textarea>
      </div>

      <div class="form-actions">
        <button type="submit" class="btn-primary flex-grow" :disabled="!canSubmit">
          <span class="btn-icon">🚀</span>
          {{ submitButtonText }}
        </button>
        <button type="button" class="btn-secondary flex-grow" @click="clearForm">
          <span class="btn-icon">🗑️</span>
          清空
        </button>
      </div>
    </form>

    <div v-if="showSuccess" class="success-message">
      <span class="success-icon">✅</span>
      <div class="success-content">
        <strong>提交成功！</strong>
        <span>概要任务已提交到处理队列，请稍后查看结果</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useTaskQueueStore } from '@/stores/taskQueue'
import { useApiConfigStore } from '@/stores/apiConfig'
import { RouterLink } from 'vue-router'
import type { SummaryStandardForgingTaskCore, SummaryEvaluationTaskCore } from '@/types'

const taskQueueStore = useTaskQueueStore()
const apiConfigStore = useApiConfigStore()

// 表单数据
const taskType = ref<'summary-standard' | 'summary-evaluation'>('summary-standard')
const passage = computed({
  get() {
    return taskQueueStore.summaryInputForm.passage
  },
  set(text) {
    taskQueueStore.summaryInputForm.passage = text
  },
})
const summary = computed({
  get() {
    return taskQueueStore.summaryInputForm.summary
  },
  set(text) {
    taskQueueStore.summaryInputForm.summary = text
  },
})
const standard = computed({
  get() {
    return taskQueueStore.summaryInputForm.standard
  },
  set(text) {
    taskQueueStore.summaryInputForm.standard = text
  },
})
const showSuccess = ref(false)

const canSubmit = computed(() => {
  const hasPassage = passage.value.trim()
  const hasApiKey = apiConfigStore.isConfigured

  if (taskType.value === 'summary-standard') {
    return hasPassage && hasApiKey
  } else {
    // summary-evaluation 需要摘要
    return hasPassage && summary.value.trim() && hasApiKey
  }
})

const submitButtonText = computed(() => {
  return taskType.value === 'summary-standard' ? '制定标准' : '评估摘要'
})

function submitSummary() {
  if (!canSubmit.value) {
    return
  }

  if (taskType.value === 'summary-standard') {
    const taskData: SummaryStandardForgingTaskCore = {
      type: 'summary-standard',
      passage: passage.value.trim(),
    }
    taskQueueStore.addTask(taskData)
  } else {
    const taskData: SummaryEvaluationTaskCore = {
      type: 'summary-evaluation',
      passage: passage.value.trim(),
      summary: summary.value.trim(),
      standard: standard.value.trim(),
    }
    taskQueueStore.addTask(taskData)
  }

  showSuccess.value = true
  clearForm()

  // 3秒后隐藏成功消息
  setTimeout(() => {
    showSuccess.value = false
  }, 3000)
}

function clearForm() {
  passage.value = ''
  summary.value = ''
  standard.value = ''
}
</script>

<style scoped>
.summary-form {
  max-width: 600px;
  margin: 0 auto;
}

.form-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-2xl);
  margin-bottom: var(--spacing-2xl);
}

.form-icon {
  font-size: 2rem;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
  border-radius: var(--border-radius-lg);
  color: white;
}

.form-title h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-text-primary);
}

.form-title p {
  margin: var(--spacing-xs) 0 0 0;
  color: var(--color-text-secondary);
  font-size: 0.9rem;
}

.summary-input-form {
  background: var(--color-surface);
  backdrop-filter: blur(10px);
  padding: var(--spacing-2xl);
  border-radius: var(--border-radius-lg);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: var(--box-shadow);
}

.radio-group {
  display: flex;
  gap: var(--spacing-lg);
  margin-top: var(--spacing-sm);
}

.radio-label {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-sm);
  cursor: pointer;
  padding: var(--spacing-md);
  border: 2px solid var(--color-border);
  border-radius: var(--border-radius);
  transition: var(--transition);
  flex: 1;
}

.radio-label:hover {
  border-color: var(--color-primary);
}

.radio-input {
  display: none;
}

.radio-input:checked + .radio-custom {
  background: var(--color-primary);
  border-color: var(--color-primary);
}

.radio-input:checked + .radio-custom::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 6px;
  height: 6px;
  background: white;
  border-radius: 50%;
}

.radio-custom {
  width: 18px;
  height: 18px;
  border: 2px solid var(--color-border);
  border-radius: 50%;
  position: relative;
  margin-top: 2px;
  flex-shrink: 0;
  transition: var(--transition);
}

.radio-text {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.radio-text strong {
  font-size: 0.95rem;
  color: var(--color-text-primary);
}

.radio-text small {
  font-size: 0.8rem;
  color: var(--color-text-secondary);
}

.label-hint {
  font-size: 0.85rem;
  color: var(--color-text-secondary);
  font-weight: normal;
  margin-left: var(--spacing-xs);
}

.btn-icon {
  font-size: 16px;
  margin-right: var(--spacing-xs);
}

.api-warning {
  display: flex;
  align-items: center;
  gap: var(--spacing-2xl);
  margin-bottom: var(--spacing-xl);
  background: linear-gradient(135deg, #fff3cd, #ffeaa7);
  color: #856404;
  padding: var(--spacing-lg) var(--spacing-xl);
  border-radius: var(--border-radius);
  border: 1px solid #ffeaa7;
  box-shadow: 0 2px 8px rgba(255, 193, 7, 0.1);
  animation: slideIn 0.3s ease;
}

.warning-icon {
  font-size: 1.5rem;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-warning);
  border-radius: 50%;
  color: white;
}

.warning-content {
  flex: 1;
}

.warning-content strong {
  display: block;
  font-size: 14px;
  margin-bottom: var(--spacing-xs);
}

.warning-content p {
  margin: 0;
  font-size: 13px;
  opacity: 0.9;
}

.warning-link {
  display: inline-block;
  margin-top: var(--spacing-sm);
  color: #856404;
  font-weight: 600;
  text-decoration: none;
  font-size: 13px;
  padding: var(--spacing-xs) var(--spacing-md);
  background: rgba(255, 193, 7, 0.2);
  border-radius: var(--border-radius-sm);
  transition: var(--transition);
}

.warning-link:hover {
  background: rgba(255, 193, 7, 0.3);
  text-decoration: underline;
}

.success-message {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  margin-top: var(--spacing-xl);
  background: linear-gradient(135deg, #d4edda, #c3e6cb);
  color: #155724;
  padding: var(--spacing-lg) var(--spacing-xl);
  border-radius: var(--border-radius);
  border: 1px solid #c3e6cb;
  box-shadow: 0 2px 8px rgba(40, 167, 69, 0.1);
  animation: slideIn 0.3s ease;
}

.success-icon {
  font-size: 1.2rem;
}

.success-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.success-content strong {
  font-size: 14px;
}

.success-content span {
  font-size: 12px;
  opacity: 0.9;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
