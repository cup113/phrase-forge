<template>
  <header class="app-header">
    <div class="header-content">
      <div class="header-main">
        <h1 class="page-title">{{ title }}</h1>
        <p class="page-subtitle">{{ subtitle }}</p>
      </div>
      <nav class="header-nav">
        <router-link to="/" class="nav-link">首页</router-link>
        <router-link to="/history" class="nav-link">学习历史</router-link>
        <router-link to="/settings" class="nav-link">设置</router-link>
      </nav>
    </div>
  </header>
</template>

<script setup lang="ts">
interface Props {
  title: string
  subtitle: string
}

defineProps<Props>()
</script>

<style scoped>
.app-header {
  background: var(--color-surface);
  backdrop-filter: blur(10px);
  padding: var(--spacing-xl) 0;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--spacing-xl);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-main {
  text-align: left;
}

.page-title {
  margin: 0;
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--color-text-primary);
  background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.page-subtitle {
  margin: var(--spacing-sm) 0 0 0;
  font-size: 1.1rem;
  color: var(--color-text-secondary);
  font-weight: 300;
}

.header-nav {
  display: flex;
  gap: var(--spacing-xl);
}

.nav-link {
  color: var(--color-text-primary);
  text-decoration: none;
  font-weight: 500;
  padding: var(--spacing-sm) var(--spacing-lg);
  border-radius: var(--border-radius-sm);
  transition: var(--transition);
}

.nav-link:hover,
.nav-link.router-link-active {
  background: rgba(32, 201, 151, 0.1);
  color: var(--color-primary);
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    gap: var(--spacing-2xl);
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

  .page-subtitle {
    font-size: 1rem;
  }
}

@media (max-width: 480px) {
  .page-title {
    font-size: 1.75rem;
  }

  .page-subtitle {
    font-size: 0.9rem;
  }

  .nav-link {
    text-align: center;
    padding: var(--spacing-md);
  }
}
</style>
