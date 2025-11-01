<template>
  <div class="home">
    <AppHeader title="语匠 - Phrase Forge" subtitle="英语写作智能辅助工具" />

    <main class="main-content">
      <section class="input-section">
        <!-- Tab 切换 -->
        <div class="tab-container">
          <div class="tab-header">
            <button
              class="tab-button"
              :class="{ active: activeTab === 'sentence-making' }"
              @click="activeTab = 'sentence-making'"
            >
              <span class="tab-icon">✍️</span>
              句子制作
            </button>
            <button
              class="tab-button"
              :class="{ active: activeTab === 'translation-comparison' }"
              @click="activeTab = 'translation-comparison'"
            >
              <span class="tab-icon">🔄</span>
              翻译对照
            </button>
            <button
              class="tab-button"
              :class="{ active: activeTab === 'summary-writing' }"
              @click="activeTab = 'summary-writing'"
            >
              <span class="tab-icon">📋</span>
              概要写作
            </button>
          </div>

          <div class="tab-content">
            <SentenceInputForm v-if="activeTab === 'sentence-making'" />
            <TranslationInputForm v-else-if="activeTab === 'translation-comparison'" />
            <SummaryInputForm v-else />
          </div>
        </div>
      </section>

      <section class="queue-section">
        <TaskQueue />
      </section>
    </main>

    <footer class="app-footer">
      <p>&copy; 2025 cup11 - 语匠 - 提升英语写作能力</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import AppHeader from '@/components/AppHeader.vue'
import SentenceInputForm from '@/components/SentenceInputForm.vue'
import TranslationInputForm from '@/components/TranslationInputForm.vue'
import SummaryInputForm from '@/components/SummaryInputForm.vue'
import TaskQueue from '@/components/TaskQueue.vue'

const activeTab = ref<'sentence-making' | 'translation-comparison' | 'summary-writing'>(
  'sentence-making',
)
</script>

<style scoped>
.home {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
  width: 100%;
  box-sizing: border-box;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  align-items: start;
}

.input-section,
.queue-section {
  margin-bottom: 0;
}

/* Tab 样式 */
.tab-container {
  width: 100%;
}

.tab-header {
  display: flex;
  background: var(--color-surface);
  border-radius: var(--border-radius-lg) var(--border-radius-lg) 0 0;
  border: 1px solid var(--color-border);
  border-bottom: none;
  overflow: hidden;
}

.tab-button {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-lg) var(--spacing-xl);
  background: transparent;
  border: none;
  color: var(--color-text-secondary);
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition);
  font-size: 0.95rem;
}

.tab-button:hover {
  background: rgba(255, 255, 255, 0.1);
  color: var(--color-text-primary);
}

.tab-button.active {
  background: var(--color-primary);
  color: white;
  font-weight: 600;
}

.tab-icon {
  font-size: 1.1rem;
}

.tab-content {
  background: var(--color-surface);
  backdrop-filter: blur(10px);
  border-radius: 0 var(--border-radius-lg) var(--border-radius-lg) var(--border-radius-lg);
  border: 1px solid var(--color-border);
  box-shadow: var(--box-shadow);
  padding: var(--spacing-2xl);
}

.app-footer {
  background: rgba(0, 0, 0, 0.8);
  color: white;
  text-align: center;
  padding: 20px;
  margin-top: auto;
}

.app-footer p {
  margin: 0;
  font-size: 0.9rem;
  opacity: 0.8;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .main-content {
    padding: 20px 15px;
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .tab-button {
    padding: var(--spacing-md) var(--spacing-lg);
    font-size: 0.9rem;
  }
}

@media (max-width: 480px) {
  .main-content {
    padding: 15px 10px;
    gap: 15px;
  }

  .tab-button {
    padding: var(--spacing-sm) var(--spacing-md);
    font-size: 0.85rem;
  }

  .tab-icon {
    font-size: 1rem;
  }
}
</style>
