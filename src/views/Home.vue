<template>
  <div class="home">
    <div class="hero">
      <h1>时光轴</h1>
      <p>记录生活中的每一个重要时刻</p>
    </div>
    
    <div class="filter-bar">
      <button 
        class="filter-btn"
        :class="{ active: !selectedPersonId }"
        @click="selectedPersonId = null"
      >
        全部
      </button>
      <button
        v-for="person in people"
        :key="person.id"
        class="filter-btn"
        :class="{ active: selectedPersonId === person.id }"
        @click="selectedPersonId = person.id"
      >
        {{ person.name }}
      </button>
    </div>
    
    <Timeline 
      :nodes="filteredNodes"
      :loading="loading"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import Timeline from '../components/Timeline.vue'
import { useTimeline } from '../composables/useTimeline'
import { usePeople } from '../composables/usePeople'

const { loading, filteredNodes, selectedPersonId, fetchNodes } = useTimeline()
const { people, fetchPeople } = usePeople()

onMounted(() => {
  fetchNodes()
  fetchPeople()
})
</script>

<style scoped>
.hero {
  text-align: center;
  padding: 3rem 1rem;
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

.filter-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  justify-content: center;
  margin-bottom: 2rem;
  padding: 0 1rem;
}

.filter-btn {
  padding: 0.5rem 1rem;
  border: 2px solid rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s;
}

.filter-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.filter-btn.active {
  background: white;
  color: #667eea;
  border-color: white;
}
</style>
