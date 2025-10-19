<template>
  <div class="settings-page">
    <AppHeader title="设置" subtitle="管理您的应用配置和数据" />

    <main class="page-content">
      <!-- API配置区域 -->
      <section class="config-section">
        <ApiConfig />
      </section>

      <!-- 数据管理区域 -->
      <section class="data-section">
        <DataManager />
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import AppHeader from '@/components/AppHeader.vue'
import ApiConfig from '@/components/ApiConfig.vue'
import DataManager from '@/components/DataManager.vue'
</script>

<style scoped>
.settings-page {
  min-height: 100vh;
}

.page-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
  display: flex;
  flex-direction: column;
  gap: 40px;
}

.config-section,
.data-section {
  width: 100%;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .page-content {
    padding: 20px 15px;
    gap: 30px;
  }
}

@media (max-width: 480px) {
  .page-content {
    padding: 15px 10px;
    gap: 25px;
  }
}
</style>
