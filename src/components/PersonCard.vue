<template>
  <div class="person-card">
    <div class="card-header">
      <div class="avatar-section">
        <img 
          v-if="person.avatar" 
          :src="person.avatar" 
          class="avatar"
          :alt="person.name"
        />
        <div v-else class="avatar-placeholder">
          {{ person.name[0] }}
        </div>
      </div>
      
      <div class="actions">
        <button class="action-btn edit" @click="$emit('edit', person)">编辑</button>
        <button class="action-btn delete" @click="$emit('delete', person.id)">删除</button>
      </div>
    </div>
    
    <div class="card-body">
      <h3 class="name">{{ person.name }}</h3>
      
      <div class="info-row">
        <ZodiacBadge :birthday="person.birthday" />
        <span v-if="person.age !== null" class="age">{{ person.age }} 岁</span>
      </div>
      
      <div v-if="person.birthday" class="info-row">
        <span class="label">生日：</span>
        <span class="value">{{ formatBirthday }}</span>
      </div>
      
      <div v-if="person.meetDate" class="info-row">
        <span class="label">认识于：</span>
        <span class="value">{{ formatMeetDate }}</span>
      </div>
      
      <div v-if="person.memo" class="memo">
        {{ person.memo }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { parseISO, format, isValid } from 'date-fns'
import ZodiacBadge from './ZodiacBadge.vue'
import type { Person } from '../composables/usePeople'

interface Props {
  person: Person & { age?: number | null }
}

const props = defineProps<Props>()

defineEmits<{
  edit: [person: Person]
  delete: [id: string]
}>()

const formatBirthday = computed(() => {
  if (!props.person.birthday) return ''
  const date = parseISO(props.person.birthday)
  return isValid(date) ? format(date, 'yyyy年MM月dd日') : props.person.birthday
})

const formatMeetDate = computed(() => {
  if (!props.person.meetDate) return ''
  const date = parseISO(props.person.meetDate)
  return isValid(date) ? format(date, 'yyyy年MM月dd日') : props.person.meetDate
})
</script>

<style scoped>
.person-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s, box-shadow 0.3s;
}

.person-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 1.5rem 1.5rem 0;
}

.avatar-section {
  flex-shrink: 0;
}

.avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid #f0f0f0;
}

.avatar-placeholder {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: bold;
  border: 4px solid #f0f0f0;
}

.actions {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  padding: 0.4rem 0.8rem;
  border: none;
  border-radius: 6px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn.edit {
  background: #e8f4f8;
  color: #2196f3;
}

.action-btn.edit:hover {
  background: #2196f3;
  color: white;
}

.action-btn.delete {
  background: #ffe8e8;
  color: #f44336;
}

.action-btn.delete:hover {
  background: #f44336;
  color: white;
}

.card-body {
  padding: 1rem 1.5rem 1.5rem;
}

.name {
  font-size: 1.4rem;
  color: #333;
  margin-bottom: 0.75rem;
}

.info-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
  flex-wrap: wrap;
}

.age {
  background: #f0f0f0;
  padding: 0.25rem 0.6rem;
  border-radius: 12px;
  font-size: 0.85rem;
  color: #666;
}

.label {
  color: #999;
  font-size: 0.9rem;
}

.value {
  color: #555;
  font-size: 0.9rem;
}

.memo {
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid #eee;
  color: #777;
  font-size: 0.9rem;
  line-height: 1.5;
}
</style>
