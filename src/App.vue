<script setup>
import { RouterView } from 'vue-router'
import NavBar from './components/NavBar.vue'
import footerBar from './components/footerBar.vue'
</script>

<template>
  <NavBar />
  <RouterView />
  <footerBar />
</template>

<style scoped></style>
