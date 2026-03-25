<template>
  <div class="home">
    <div class="hero">
      <h1>时光轴</h1>
      <p>记录生活中的每一个重要时刻</p>
    </div>

    <Timeline
      :nodes="sortedNodes"
      :loading="loading"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import Timeline from '../components/Timeline.vue'
import { useTimeline } from '../composables/useTimeline'

const { loading, sortedNodes, fetchNodes } = useTimeline()

onMounted(() => {
  fetchNodes()
})
</script>

<style scoped>
.home {
  padding-bottom: 3rem;
}

.hero {
  text-align: center;
  padding: 3rem 1rem 2rem;
  color: white;
}

.hero h1 {
  font-size: 3rem;
  margin-bottom: 1rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.hero p {
  font-size: 1.2rem;
  opacity: 0.9;
}
</style>
