<template>
  <div class="frame">
    <div class="frame-header">
      <div class="author">
        <img 
          v-if="person?.avatar" 
          :src="person.avatar" 
          class="avatar"
          :alt="person?.name"
        />
        <div v-else class="avatar-placeholder">
          {{ person?.name?.[0] || '?' }}
        </div>
        <span class="author-name">{{ person?.name || '未知' }}</span>
      </div>
    </div>
    
    <div v-if="frame.content" class="frame-content">
      {{ frame.content }}
    </div>
    
    <div v-if="frame.images?.length" class="frame-images">
      <img 
        v-for="(img, index) in frame.images" 
        :key="index"
        :src="img"
        class="frame-image"
        @click="viewImage(img)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { TimelineFrame as TimelineFrameType } from '../composables/useTimeline'
import type { Person } from '../composables/usePeople'

interface Props {
  frame: TimelineFrameType
}

const props = defineProps<Props>()

// Mock person data - in real app, this would come from usePeople
const person = computed<Partial<Person>>(() => ({
  id: props.frame.personId,
  name: '用户 ' + props.frame.personId.slice(-3),
  avatar: undefined
}))

const viewImage = (img: string) => {
  window.open(img, '_blank')
}
</script>

<style scoped>
.frame {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 0.75rem;
}

.frame:last-child {
  margin-bottom: 0;
}

.frame-header {
  display: flex;
  align-items: center;
  margin-bottom: 0.75rem;
}

.author {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: bold;
}

.author-name {
  font-weight: 500;
  color: #555;
  font-size: 0.9rem;
}

.frame-content {
  color: #444;
  line-height: 1.6;
  margin-bottom: 0.75rem;
  white-space: pre-wrap;
}

.frame-images {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 0.5rem;
}

.frame-image {
  width: 100%;
  height: 120px;
  object-fit: cover;
  border-radius: 8px;
  cursor: pointer;
  transition: transform 0.2s;
}

.frame-image:hover {
  transform: scale(1.05);
}

@media (max-width: 480px) {
  .frame-images {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
