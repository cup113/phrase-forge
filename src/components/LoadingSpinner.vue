<template>
  <div v-if="show" class="loading-spinner">
    <div class="spinner-overlay" v-if="overlay"></div>
    <div
      class="spinner-container"
      :class="{
        'spinner-center': center,
        'spinner-small': size === 'small',
        'spinner-large': size === 'large',
      }"
    >
      <div class="spinner">
        <div class="spinner-ring"></div>
        <div class="spinner-ring"></div>
        <div class="spinner-ring"></div>
        <div class="spinner-ring"></div>
      </div>
      <div v-if="message" class="spinner-message">{{ message }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  show: boolean
  message?: string
  overlay?: boolean
  center?: boolean
  size?: 'small' | 'medium' | 'large'
}

withDefaults(defineProps<Props>(), {
  show: false,
  overlay: false,
  center: true,
  size: 'medium',
})
</script>

<style scoped>
.loading-spinner {
  position: relative;
}

.spinner-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(4px);
  z-index: 999;
}

.spinner-container {
  position: relative;
  z-index: 1000;
}

.spinner-center {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.spinner {
  display: inline-block;
  position: relative;
}

.spinner-ring {
  box-sizing: border-box;
  display: block;
  position: absolute;
  border: 2px solid var(--color-info);
  border-radius: 50%;
  animation: spinner 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
  border-color: var(--color-info) transparent transparent transparent;
}

.spinner-small .spinner-ring {
  width: 20px;
  height: 20px;
  margin: 2px;
  border-width: 2px;
}

.spinner-container:not(.spinner-small):not(.spinner-large) .spinner-ring {
  width: 40px;
  height: 40px;
  margin: 4px;
  border-width: 3px;
}

.spinner-large .spinner-ring {
  width: 60px;
  height: 60px;
  margin: 6px;
  border-width: 4px;
}

.spinner-ring:nth-child(1) {
  animation-delay: -0.45s;
}

.spinner-ring:nth-child(2) {
  animation-delay: -0.3s;
}

.spinner-ring:nth-child(3) {
  animation-delay: -0.15s;
}

.spinner-ring:nth-child(4) {
  animation-delay: 0s;
}

@keyframes spinner {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.spinner-message {
  margin-top: var(--spacing-md);
  text-align: center;
  color: var(--color-info);
  font-size: 14px;
  font-weight: 500;
}

.spinner-small .spinner-message {
  font-size: 12px;
  margin-top: var(--spacing-sm);
}

.spinner-large .spinner-message {
  font-size: 16px;
  margin-top: var(--spacing-lg);
}
</style>
