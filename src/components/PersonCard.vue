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

      <!-- 时间段展示 -->
      <div v-if="person.timeRanges && person.timeRanges.length > 0" class="time-ranges">
        <div class="ranges-title">重要时间段</div>
        <div class="ranges-list">
          <div
            v-for="range in person.timeRanges"
            :key="range.id"
            class="range-tag"
            @click="showRangeDetail(range)"
          >
            <span class="range-title">{{ range.title }}</span>
            <span class="range-date">{{ formatRangeDate(range) }}</span>
          </div>
        </div>
      </div>

      <div v-if="person.memo" class="memo">
        {{ person.memo }}
      </div>
    </div>
  </div>

  <!-- 时间段详情弹窗 -->
  <div v-if="selectedRange" class="range-modal-overlay" @click.self="selectedRange = null">
    <div class="range-modal">
      <h4>{{ selectedRange.title }}</h4>
      <p class="range-modal-date">{{ formatRangeDate(selectedRange) }}</p>
      <p v-if="selectedRange.description" class="range-modal-desc">{{ selectedRange.description }}</p>
      <button class="close-btn" @click="selectedRange = null">关闭</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { parseISO, format, isValid } from 'date-fns'
import ZodiacBadge from './ZodiacBadge.vue'
import type { Person, TimeRange } from '../composables/usePeople'

interface Props {
  person: Person & { age?: number | null }
}

const props = defineProps<Props>()

const selectedRange = ref<TimeRange | null>(null)

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

const formatRangeDate = (range: TimeRange): string => {
  const start = parseISO(range.startDate)
  const startStr = isValid(start) ? format(start, 'yyyy.MM.dd') : range.startDate

  if (range.endDate === 'present') {
    return `${startStr} - 至今`
  }

  const end = parseISO(range.endDate)
  const endStr = isValid(end) ? format(end, 'yyyy.MM.dd') : range.endDate
  return `${startStr} - ${endStr}`
}

const showRangeDetail = (range: TimeRange) => {
  selectedRange.value = range
}
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

/* 时间段样式 */
.time-ranges {
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid #eee;
}

.ranges-title {
  font-size: 0.85rem;
  color: #667eea;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.ranges-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.range-tag {
  background: linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%);
  border: 1px solid #d8b4fe;
  border-radius: 8px;
  padding: 0.5rem 0.75rem;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.range-tag:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(139, 92, 246, 0.2);
}

.range-title {
  font-size: 0.85rem;
  font-weight: 500;
  color: #7c3aed;
}

.range-date {
  font-size: 0.75rem;
  color: #8b5cf6;
}

.memo {
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid #eee;
  color: #777;
  font-size: 0.9rem;
  line-height: 1.5;
}

/* 时间段详情弹窗 */
.range-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.range-modal {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  max-width: 350px;
  width: 90%;
}

.range-modal h4 {
  color: #333;
  margin-bottom: 0.5rem;
  font-size: 1.1rem;
}

.range-modal-date {
  color: #667eea;
  font-size: 0.9rem;
  margin-bottom: 1rem;
}

.range-modal-desc {
  color: #666;
  font-size: 0.9rem;
  line-height: 1.5;
  margin-bottom: 1rem;
}

.close-btn {
  width: 100%;
  padding: 0.75rem;
  background: #f0f0f0;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
}

.close-btn:hover {
  background: #e0e0e0;
}
</style>
