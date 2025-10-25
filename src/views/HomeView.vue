<template>
  <div class="home">
    <AppHeader title="语匠 - Phrase Forge" subtitle="英语写作智能辅助工具" />

    <main class="main-content">
      <section class="input-section">
        <InputForm />
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
import AppHeader from '@/components/AppHeader.vue'
import InputForm from '@/components/InputForm.vue'
import TaskQueue from '@/components/TaskQueue.vue'
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
}

@media (max-width: 480px) {
  .main-content {
    padding: 15px 10px;
    gap: 15px;
  }
}
</style>
