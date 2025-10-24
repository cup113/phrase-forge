<template>
  <div class="input-form">
    <div class="form-header">
      <div class="form-icon">✍️</div>
      <div class="form-title">
        <h2>提交句子</h2>
        <p>输入关键词和句子，获取AI评估和改进建议</p>
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
        <button type="submit" class="btn-primary" :disabled="!canSubmit">
          <span class="btn-icon">🚀</span>
          提交评估
        </button>
        <button type="button" class="btn-secondary" @click="clearForm">
          <span class="btn-icon">🗑️</span>
          清空
        </button>
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

const canSubmit = computed(() => {
  return keyword.value.trim() && sentence.value.trim() && apiConfigStore.isConfigured
})

function submitSentence() {
  if (!canSubmit.value) {
    return
  }

  taskQueueStore.addTask(keyword.value.trim(), sentence.value.trim(), scenario.value.trim())

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
</script>

<style scoped>
.input-form {
  max-width: 600px;
  margin: 0 auto;
}

.form-header {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 25px;
}

.form-icon {
  font-size: 2rem;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #20c997, #17a2b8);
  border-radius: 12px;
  color: white;
}

.form-title h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: #333;
}

.form-title p {
  margin: 5px 0 0 0;
  color: #666;
  font-size: 0.9rem;
}

.sentence-form {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  padding: 25px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.form-group {
  margin-bottom: 20px;
}

label {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  font-weight: 600;
  color: #333;
  font-size: 14px;
}

.label-icon {
  font-size: 16px;
}

input,
textarea {
  width: 100%;
  padding: 12px 15px;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 14px;
  box-sizing: border-box;
  font-family: inherit;
  background: white;
  transition: all 0.2s ease;
}

input:focus,
textarea:focus {
  outline: none;
  border-color: #20c997;
  box-shadow: 0 0 0 3px rgba(32, 201, 151, 0.1);
  transform: translateY(-1px);
}

textarea {
  resize: vertical;
  min-height: 80px;
}

.form-actions {
  display: flex;
  gap: 12px;
  margin-top: 25px;
}

.btn-primary,
.btn-secondary {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  flex: 1;
  justify-content: center;
}

.btn-primary {
  background: linear-gradient(135deg, #20c997, #17a2b8);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(32, 201, 151, 0.3);
}

.btn-primary:disabled {
  background: #6c757d;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background: #5a6268;
  transform: translateY(-1px);
}

.btn-icon {
  font-size: 16px;
}

.success-message {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 20px;
  background: linear-gradient(135deg, #d4edda, #c3e6cb);
  color: #155724;
  padding: 16px 20px;
  border-radius: 8px;
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
  gap: 2px;
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
