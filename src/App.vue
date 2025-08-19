<script setup>
import { RouterView } from 'vue-router'
import NavBar from './components/NavBar.vue'
import footerBar from './components/footerBar.vue'
</script>

<template>
  <NavBar />
  <div class="main-content">
    <RouterView />
  </div>
  <footerBar />
</template>

<style scoped></style>
