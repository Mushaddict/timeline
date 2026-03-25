<template>
  <div
    class="node-card"
    :class="[node.type, { expanded: isExpanded }]"
  >
    <div class="node-marker" @click="toggleExpand">
      <div class="node-dot" :class="node.type">
        <span v-if="node.type === 'range'">~</span>
      </div>
    </div>

    <div class="node-content" @click="toggleExpand">
      <div class="node-header">
        <span class="node-date">{{ formatDisplayDate }}</span>
        <span v-if="isToday" class="today-badge">今天</span>
      </div>

      <h3 class="node-title">{{ node.title }}</h3>

      <div class="node-meta">
        <span class="node-type-badge" :class="node.type">
          {{ node.type === 'point' ? '时间点' : '时间段' }}
        </span>
        <span class="frame-count">{{ node.frames.length }} 个记录</span>
      </div>
    </div>

    <div v-if="isExpanded" class="node-frames">
      <TimelineFrame
        v-for="frame in node.frames"
        :key="frame.id"
        :frame="frame"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { parseISO, isSameDay, isValid, format } from 'date-fns'
import TimelineFrame from './TimelineFrame.vue'
import type { TimelineNode } from '../composables/useTimeline'

interface Props {
  node: TimelineNode
}

const props = defineProps<Props>()

const isExpanded = ref(false)

const toggleExpand = () => {
  isExpanded.value = !isExpanded.value
}

const isToday = computed(() => {
  const date = parseISO(props.node.date)
  return isValid(date) && isSameDay(date, new Date())
})

const formatDisplayDate = computed(() => {
  const start = parseISO(props.node.date)
  if (!isValid(start)) return props.node.date

  if (props.node.endDate) {
    const end = parseISO(props.node.endDate)
    if (isValid(end)) {
      return `${format(start, 'yyyy.MM.dd')} - ${format(end, 'yyyy.MM.dd')}`
    }
  }

  return format(start, 'yyyy.MM.dd')
})
</script>

<style scoped>
.node-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  padding: 1.5rem;
  width: 100%;
  position: relative;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  cursor: pointer;
}

.node-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
}

.node-card.expanded {
  background: white;
}

.node-marker {
  position: absolute;
  top: 1.5rem;
  left: -35px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.node-dot {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #667eea;
  border: 3px solid white;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 0.8rem;
  font-weight: bold;
}

.node-dot.range {
  width: 24px;
  height: 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.node-content {
  margin-left: 0.5rem;
}

.node-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.node-date {
  color: #667eea;
  font-weight: 600;
  font-size: 0.9rem;
}

.today-badge {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a5a 100%);
  color: white;
  padding: 0.2rem 0.5rem;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: bold;
}

.node-title {
  color: #333;
  font-size: 1.2rem;
  margin-bottom: 0.75rem;
  line-height: 1.4;
}

.node-meta {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.node-type-badge {
  padding: 0.25rem 0.6rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
}

.node-type-badge.point {
  background: #e8f4f8;
  color: #2196f3;
}

.node-type-badge.range {
  background: #f3e8ff;
  color: #9c27b0;
}

.frame-count {
  color: #999;
  font-size: 0.8rem;
}

.node-frames {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #eee;
  animation: slideDown 0.3s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
