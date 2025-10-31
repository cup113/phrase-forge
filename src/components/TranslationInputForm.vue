<template>
  <div class="translation-form">
    <div class="form-header">
      <div class="form-icon">🔄</div>
      <div class="form-title">
        <h2>翻译对照</h2>
        <p>输入中文原文和多个翻译版本，获取AI评估和对比建议</p>
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

    <form @submit.prevent="submitTranslation" class="translation-input-form">
      <div class="form-group">
        <label for="original">
          <span class="label-icon">📖</span>
          中文原文
        </label>
        <textarea
          id="original"
          v-model="original"
          placeholder="请输入要翻译的中文原文"
          rows="3"
          required
        ></textarea>
      </div>

      <div class="form-group">
        <label for="translations">
          <span class="label-icon">🔄</span>
          英文翻译对照
          <span class="label-hint">（每行一个英文段落，用 [选项1/选项2] 格式）</span>
        </label>
        <textarea
          id="translations"
          v-model="translationsInput"
          placeholder="例如：
I [want to/would like to] [go for a walk/take a walk] in the park
The weather is [nice/beautiful] today
She [is studying/studies] English every day"
          rows="6"
          required
        ></textarea>
        <div class="input-hint">
          <strong>语法说明：</strong>
          <ul>
            <li>每行一个英文翻译段落</li>
            <li>用方括号 [] 包含翻译选项</li>
            <li>选项之间用斜杠 / 分隔</li>
            <li>示例：I [want to/would like to] [go for a walk/take a walk] in the park</li>
          </ul>
        </div>
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
    </form>

    <div v-if="showSuccess" class="success-message">
      <span class="success-icon">✅</span>
      <div class="success-content">
        <strong>提交成功！</strong>
        <span>翻译对照任务已提交到处理队列，请稍后查看结果</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useTaskQueueStore } from '@/stores/taskQueue'
import { useApiConfigStore } from '@/stores/apiConfig'
import { RouterLink } from 'vue-router'
import type { TranslationComparisonTaskCore } from '@/types'

const taskQueueStore = useTaskQueueStore()
const apiConfigStore = useApiConfigStore()

// 表单数据
const original = ref('')
const translationsInput = ref('')
const showSuccess = ref(false)

const canSubmit = computed(() => {
  return original.value.trim() && translationsInput.value.trim() && apiConfigStore.isConfigured
})

function submitTranslation() {
  if (!canSubmit.value) {
    return
  }

  // 解析多行输入
  const translations = parseTranslationsInput(translationsInput.value)

  if (translations.length === 0) {
    return
  }

  const taskData: TranslationComparisonTaskCore = {
    type: 'translation-comparison',
    original: original.value.trim(),
    translations: translations,
  }

  taskQueueStore.addTask(taskData)

  showSuccess.value = true
  clearForm()

  // 3秒后隐藏成功消息
  setTimeout(() => {
    showSuccess.value = false
  }, 3000)
}

function clearForm() {
  original.value = ''
  translationsInput.value = ''
}

function parseTranslationsInput(input: string): string[][] {
  const lines = input.split('\n').filter((line) => line.trim())
  const result: string[][] = []

  for (const line of lines) {
    // 匹配 [选项1/选项2/选项3] 格式
    const bracketMatch = line.match(/\[(.*?)\]/)
    if (bracketMatch && bracketMatch[1]) {
      const options = bracketMatch[1]
        .split('/')
        .map((option) => option.trim())
        .filter((option) => option.length > 0)

      if (options.length > 0) {
        result.push(options)
      }
    }
  }

  return result
}
</script>

<style scoped>
.translation-form {
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

.translation-input-form {
  background: var(--color-surface);
  backdrop-filter: blur(10px);
  padding: var(--spacing-2xl);
  border-radius: var(--border-radius-lg);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: var(--box-shadow);
}

.label-hint {
  font-size: 0.85rem;
  color: var(--color-text-secondary);
  font-weight: normal;
  margin-left: var(--spacing-xs);
}

.input-hint {
  margin-top: var(--spacing-sm);
  padding: var(--spacing-md);
  background: rgba(248, 249, 250, 0.8);
  border-radius: var(--border-radius-sm);
  border: 1px solid var(--color-border);
  font-size: 0.85rem;
  color: var(--color-text-secondary);
}

.input-hint strong {
  color: var(--color-text-primary);
  display: block;
  margin-bottom: var(--spacing-xs);
}

.input-hint ul {
  margin: var(--spacing-xs) 0 0 0;
  padding-left: var(--spacing-lg);
}

.input-hint li {
  margin-bottom: var(--spacing-xs);
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
