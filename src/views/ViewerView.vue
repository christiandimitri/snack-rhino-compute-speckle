<template>
  <div></div>
</template>
<script setup>
import ThreeService from '@/composable/ThreeService.js'
import { onMounted } from 'vue'
const threeService = new ThreeService()
onMounted(() => {
  threeService.init()
})
console.log(threeService)
</script>

<style></style>
