<template>
  <div id="app">
    <AccountForm />
  </div>
</template>

<script setup lang="ts">
import AccountForm from './components/AccountForm.vue'
</script>

<style>
#app {
  min-height: 100vh;
  background-color: #f8f9fa;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
}

body {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

*, *::before, *::after {
  box-sizing: inherit;
}
</style>
