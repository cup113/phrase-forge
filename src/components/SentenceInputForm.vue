<template>
  <div class="input-form">
    <div class="form-header">
      <div class="form-icon">✍️</div>
      <div class="form-title">
        <h2>提交句子</h2>
        <p>输入关键词和句子，获取AI评估和改进建议</p>
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

    <form @submit.prevent="submitSentence" class="sentence-form">
      <div class="form-group">
        <label for="keyword">
          <span class="label-icon">🔤</span>
          关键词
        </label>
        <input
          id="keyword"
          v-model="keyword"
          type="text"
          placeholder="请输入要练习的英语单词或短语"
          required
        />
      </div>

      <div class="form-group">
        <label for="sentence">
          <span class="label-icon">📝</span>
          造句
        </label>
        <textarea
          id="sentence"
          v-model="sentence"
          placeholder="请使用上面的关键词造一个句子"
          rows="3"
          required
        ></textarea>
      </div>

      <div class="form-group">
        <label for="scenario">
          <span class="label-icon">🎯</span>
          应用场景
        </label>
        <input id="scenario" v-model="scenario" placeholder="请描述这个句子使用的场景" />
      </div>

      <div class="form-actions">
        <button type="submit" class="btn-primary flex-grow" :disabled="!canSubmit">
          <span class="btn-icon">🚀</span>
          提交评估
        </button>
        <button type="button" class="btn-secondary flex-grow" @click="clearForm">
          <span class="btn-icon">🗑️</span>
          清空
        </button>
      </div>

      <!-- 第二行按钮 -->
      <div class="form-actions-secondary">
        <button
          v-if="hasIncompleteTasks"
          type="button"
          class="btn-primary flex-grow"
          @click="loadNextTask"
        >
          <span class="btn-icon">⏭️</span>
          下一个任务
        </button>
        <button type="button" class="btn-secondary flex-grow" @click="toggleBatchInput">
          <span class="btn-icon">📋</span>
          批量添加任务
        </button>
      </div>

      <!-- 批量输入区域 -->
      <div v-if="showBatchInput" class="batch-input-section">
        <div class="form-group">
          <label for="batch-keywords">
            <span class="label-icon">📝</span>
            批量关键词（每行一个）
          </label>
          <textarea
            id="batch-keywords"
            v-model="batchKeywords"
            placeholder="请输入要练习的英语单词或短语，每行一个"
            rows="4"
          ></textarea>
        </div>
        <div class="batch-actions">
          <button
            type="button"
            class="btn-primary"
            @click="addBatchTasks"
            :disabled="!batchKeywords.trim()"
          >
            <span class="btn-icon">➕</span>
            添加任务
          </button>
          <button type="button" class="btn-secondary" @click="clearBatchInput">
            <span class="btn-icon">🗑️</span>
            清空
          </button>
        </div>
      </div>
    </form>

    <div v-if="showSuccess" class="success-message">
      <span class="success-icon">✅</span>
      <div class="success-content">
        <strong>提交成功！</strong>
        <span>句子已提交到处理队列，请稍后查看结果</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useTaskQueueStore } from '@/stores/taskQueue'
import { useApiConfigStore } from '@/stores/apiConfig'
import { RouterLink } from 'vue-router'
import type { SentenceMakingTaskCore } from '@/types'

const taskQueueStore = useTaskQueueStore()
const apiConfigStore = useApiConfigStore()

const generateGetter = (key: 'keyword' | 'sentence' | 'scenario') => ({
  get: () => {
    return taskQueueStore.inputTaskForm[key]
  },
  set: (value: string) => {
    taskQueueStore.inputTaskForm[key] = value
  },
})
const keyword = computed(generateGetter('keyword'))
const sentence = computed(generateGetter('sentence'))
const scenario = computed(generateGetter('scenario'))
const showSuccess = ref(false)

// 批量添加相关状态
const showBatchInput = ref(false)
const batchKeywords = ref('')
const hasIncompleteTasks = computed(() => taskQueueStore.hasIncompleteTasks)

const canSubmit = computed(() => {
  return keyword.value.trim() && sentence.value.trim() && apiConfigStore.isConfigured
})

function submitSentence() {
  if (!canSubmit.value) {
    return
  }

  // 检查当前关键词是否对应一个 incomplete 任务
  const incompleteTask = taskQueueStore.incompleteTasks.find(
    (task) => task.type === 'sentence-making' && task.keyword === keyword.value.trim(),
  )

  if (incompleteTask) {
    // 如果是 incomplete 任务，更新它而不是创建新任务
    taskQueueStore.completeIncompleteTask(
      incompleteTask.id,
      sentence.value.trim(),
      scenario.value.trim(),
    )
  } else {
    // 否则创建新任务
    const taskData: SentenceMakingTaskCore = {
      type: 'sentence-making',
      keyword: keyword.value.trim(),
      sentence: sentence.value.trim(),
      scenario: scenario.value.trim(),
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
  keyword.value = ''
  sentence.value = ''
  scenario.value = ''
}

function toggleBatchInput() {
  showBatchInput.value = !showBatchInput.value
  if (!showBatchInput.value) {
    clearBatchInput()
  }
}

function clearBatchInput() {
  batchKeywords.value = ''
}

function addBatchTasks() {
  if (!batchKeywords.value.trim()) {
    return
  }

  const keywords = batchKeywords.value.split('\n').filter((k) => k.trim())
  taskQueueStore.addIncompleteTasks(keywords)

  showSuccess.value = true
  clearBatchInput()
  showBatchInput.value = false

  // 3秒后隐藏成功消息
  setTimeout(() => {
    showSuccess.value = false
  }, 3000)
}

function loadNextTask() {
  const nextTask = taskQueueStore.getNextIncompleteTask()
  if (nextTask) {
    sentence.value = ''
    scenario.value = ''
  }
}
</script>

<style scoped>
.input-form {
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

.sentence-form {
  background: var(--color-surface);
  backdrop-filter: blur(10px);
  padding: var(--spacing-2xl);
  border-radius: var(--border-radius-lg);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: var(--box-shadow);
}

.batch-input-section {
  margin-top: var(--spacing-xl);
  padding: var(--spacing-xl);
  background: rgba(248, 249, 250, 0.8);
  border-radius: var(--border-radius);
  border: 1px solid var(--color-border);
}

.batch-actions {
  display: flex;
  gap: var(--spacing-md);
  margin-top: var(--spacing-2xl);
}

.btn-icon {
  font-size: 16px;
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
