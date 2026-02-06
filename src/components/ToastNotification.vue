<script setup>
import { useToastStore } from '@/stores/toast'

const toastStore = useToastStore()
const { toasts } = toastStore

const removeToast = (id) => {
  toastStore.removeToast(id)
}
</script>

<template>
  <div class="toast-container">
    <transition-group name="toast">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="toast-item"
        :class="['toast-' + toast.type]"
        @click="removeToast(toast.id)"
      >
        <div class="toast-content">
          {{ toast.message }}
        </div>
      </div>
    </transition-group>
  </div>
</template>

<style scoped>
.toast-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 10px;
  pointer-events: none; /* Allow clicks to pass through container */
}

.toast-item {
  min-width: 250px;
  max-width: 350px;
  padding: 12px 20px;
  border-radius: 8px;
  color: white;
  font-size: 14px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  cursor: pointer;
  pointer-events: auto; /* Enable clicks on toasts */
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
}

.toast-success {
  background-color: #4caf50;
}

.toast-error {
  background-color: #f44336;
}

.toast-warning {
  background-color: #ff9800;
}

.toast-info {
  background-color: #2196f3;
}

/* Transitions */
.toast-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.toast-enter-active {
  transition: all 0.3s ease;
}

.toast-leave-active {
  transition: all 0.3s ease;
  position: absolute; /* Ensure smooth removal layout shift */
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

.toast-move {
  transition: all 0.3s ease;
}
</style>
