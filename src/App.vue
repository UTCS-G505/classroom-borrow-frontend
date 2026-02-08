<script setup>
import { RouterView } from 'vue-router'
import NavBar from '@/components/NavBar.vue'
import footerBar from './components/footerBar.vue'
import ToastNotification from '@/components/ToastNotification.vue'
</script>

<template>
  <header>
    <NavBar />
  </header>
  <ToastNotification />
  <div class="main-content">
    <RouterView :key="$route.fullPath" />
  </div>
  <footerBar />
</template>

<style scoped></style>
