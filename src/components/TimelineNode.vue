<template>
  <div
    class="node-card"
    :class="[node.type, { expanded: isExpanded, hovered: isHovered }]"
    @click="toggleExpand"
  >
    <div class="node-content">
      <h3 class="node-title">{{ node.title }}</h3>

      <p v-if="node.happened" class="node-happened">{{ node.happened }}</p>

      <div class="node-meta">
        <span class="node-type-badge" :class="node.type">
          {{ node.type === 'point' ? '时间点' : '时间段' }}
        </span>
        <span v-if="node.isAllDay" class="allday-badge">全天</span>
        <span v-if="node.thought" class="thought-badge">💭</span>
        <span v-if="node.note" class="note-badge">📝</span>
      </div>
    </div>

    <div v-if="isExpanded" class="node-details">
      <div v-if="node.thought" class="detail-section">
        <h4>想法</h4>
        <p>{{ node.thought }}</p>
      </div>
      <div v-if="node.note" class="detail-section">
        <h4>备注</h4>
        <p>{{ node.note }}</p>
      </div>

      <div v-if="node.frames.length > 0" class="node-frames">
        <TimelineFrame
          v-for="frame in node.frames"
          :key="frame.id"
          :frame="frame"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import TimelineFrame from './TimelineFrame.vue'
import type { TimelineNode } from '../composables/useTimeline'

interface Props {
  node: TimelineNode
  isHovered?: boolean
}

defineProps<Props>()

const isExpanded = ref(false)

const toggleExpand = () => {
  isExpanded.value = !isExpanded.value
}
</script>

<style scoped>
.node-card {
  flex: 1;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  padding: 1.25rem 1.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  cursor: pointer;
}

.node-card:hover,
.node-card.hovered {
  transform: translateY(-4px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
  background: white;
}

.node-card.expanded {
  background: white;
}

.node-content {
  margin-left: 0;
}

.node-title {
  color: #333;
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
  line-height: 1.4;
}

.node-happened {
  color: #666;
  font-size: 0.95rem;
  line-height: 1.5;
  margin-bottom: 0.75rem;
}

.node-meta {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  flex-wrap: wrap;
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

.allday-badge {
  background: #4ade80;
  color: white;
  padding: 0.15rem 0.5rem;
  border-radius: 6px;
  font-size: 0.7rem;
  font-weight: 600;
}

.thought-badge,
.note-badge {
  font-size: 0.85rem;
}

.node-details {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #eee;
  animation: slideDown 0.3s ease;
}

.detail-section {
  margin-bottom: 1rem;
}

.detail-section:last-child {
  margin-bottom: 0;
}

.detail-section h4 {
  color: #667eea;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}

.detail-section p {
  color: #555;
  font-size: 0.9rem;
  line-height: 1.5;
}

.node-frames {
  margin-top: 1rem;
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
