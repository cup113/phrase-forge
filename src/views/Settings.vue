<template>
  <div class="settings-page">
    <header class="page-header">
      <div class="header-content">
        <div class="header-main">
          <h1 class="page-title">设置</h1>
          <p class="page-subtitle">管理您的应用配置和数据</p>
        </div>
        <nav class="header-nav">
          <router-link to="/" class="nav-link">首页</router-link>
          <router-link to="/history" class="nav-link">学习历史</router-link>
          <router-link to="/settings" class="nav-link">设置</router-link>
        </nav>
      </div>
    </header>

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
import ApiConfig from '@/components/ApiConfig.vue'
import DataManager from '@/components/DataManager.vue'
</script>

<style scoped>
.settings-page {
  min-height: 100vh;
}

.page-header {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  padding: 30px 0;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-main {
  text-align: left;
}

.header-nav {
  display: flex;
  gap: 20px;
}

.nav-link {
  color: #333;
  text-decoration: none;
  font-weight: 500;
  padding: 8px 16px;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.nav-link:hover,
.nav-link.router-link-active {
  background: rgba(32, 201, 151, 0.1);
  color: #20c997;
}

.page-title {
  margin: 0;
  font-size: 2.5rem;
  font-weight: 700;
  color: #333;
  background: linear-gradient(135deg, #20c997, #17a2b8);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.page-subtitle {
  margin: 10px 0 0 0;
  font-size: 1.1rem;
  color: #666;
  font-weight: 300;
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
  .header-content {
    flex-direction: column;
    gap: 15px;
    text-align: center;
  }

  .header-main {
    text-align: center;
  }

  .header-nav {
    justify-content: center;
  }

  .page-title {
    font-size: 2rem;
  }

  .page-content {
    padding: 20px 15px;
    gap: 30px;
  }
}

@media (max-width: 480px) {
  .page-title {
    font-size: 1.75rem;
  }

  .page-subtitle {
    font-size: 0.9rem;
  }

  .header-nav {
    flex-direction: column;
    gap: 10px;
    width: 100%;
  }

  .nav-link {
    text-align: center;
    padding: 10px;
  }

  .page-content {
    padding: 15px 10px;
    gap: 25px;
  }
}
</style>
