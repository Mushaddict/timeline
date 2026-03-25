<template>
  <div class="timeline">
    <div v-if="loading" class="loading">加载中...</div>

    <div v-else-if="nodes.length === 0" class="empty">
      还没有时间记录，快去添加一些吧！
    </div>

    <div v-else class="timeline-container">
      <div class="timeline-line"></div>

      <div
        v-for="node in nodes"
        :key="node.id"
        class="timeline-item"
        @mouseenter="hoveredNodeId = node.id"
        @mouseleave="hoveredNodeId = null"
      >
        <!-- 左侧日期显示 -->
        <div class="date-sidebar">
          <!-- 默认显示：月份聚合 -->
          <div v-if="hoveredNodeId !== node.id" class="month-badge">
            <span class="month-name">{{ formatMonth(node.date) }}</span>
            <span class="year">{{ formatYear(node.date) }}</span>
          </div>
          <!-- 悬浮显示：具体日期 -->
          <div v-else class="date-detail">
            <span class="detail-date">{{ formatDateFull(node.date) }}</span>
            <span v-if="node.endDate" class="detail-range">
              ~ {{ formatDateFull(node.endDate) }}
            </span>
          </div>
        </div>

        <!-- 时间线节点 -->
        <div class="timeline-marker">
          <div class="node-dot" :class="{ 'range': node.endDate, 'allday': node.isAllDay }">
            <span v-if="node.endDate && !node.isAllDay">~</span>
            <span v-else-if="node.isAllDay">☀</span>
          </div>
        </div>

        <!-- 节点内容 -->
        <TimelineNode
          :node="node"
          :is-hovered="hoveredNodeId === node.id"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { parseISO, format, isValid } from 'date-fns'
import TimelineNode from './TimelineNode.vue'
import type { TimelineNode as TimelineNodeType } from '../composables/useTimeline'

gsap.registerPlugin(ScrollTrigger)

interface Props {
  nodes: TimelineNodeType[]
  loading?: boolean
}

defineProps<Props>()

const hoveredNodeId = ref<string | null>(null)

const formatMonth = (dateStr: string): string => {
  const date = parseISO(dateStr)
  if (!isValid(date)) return ''
  return format(date, 'MM月')
}

const formatYear = (dateStr: string): string => {
  const date = parseISO(dateStr)
  if (!isValid(date)) return ''
  return format(date, 'yyyy')
}

const formatDateFull = (dateStr: string): string => {
  const date = parseISO(dateStr)
  if (!isValid(date)) return dateStr
  return format(date, 'yyyy.MM.dd')
}

onMounted(() => {
  // Animate timeline items on scroll
  const items = document.querySelectorAll('.timeline-item')

  items.forEach((item) => {
    gsap.fromTo(item,
      {
        opacity: 0,
        y: 30
      },
      {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: item,
          start: 'top 85%',
          toggleActions: 'play none none reverse'
        }
      }
    )
  })

  // Animate timeline line
  gsap.fromTo('.timeline-line',
    { scaleY: 0 },
    {
      scaleY: 1,
      duration: 1.5,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: '.timeline-container',
        start: 'top 70%'
      }
    }
  )
})
</script>

<style scoped>
.timeline {
  padding: 2rem 0;
}

.loading, .empty {
  text-align: center;
  color: white;
  padding: 3rem;
  font-size: 1.1rem;
}

.timeline-container {
  position: relative;
  padding: 2rem 0;
  max-width: 900px;
  margin: 0 auto;
}

.timeline-line {
  position: absolute;
  left: 120px;
  top: 0;
  bottom: 0;
  width: 3px;
  background: linear-gradient(to bottom, rgba(255,255,255,0.2), rgba(255,255,255,0.5), rgba(255,255,255,0.2));
  transform-origin: top;
  border-radius: 2px;
}

.timeline-item {
  position: relative;
  display: flex;
  align-items: flex-start;
  margin-bottom: 2rem;
  padding-left: 0;
}

.timeline-item:last-child {
  margin-bottom: 0;
}

/* 左侧日期栏 */
.date-sidebar {
  width: 100px;
  flex-shrink: 0;
  padding-right: 1rem;
  text-align: right;
}

.month-badge {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  color: rgba(255, 255, 255, 0.7);
  transition: all 0.3s ease;
}

.month-name {
  font-size: 1.2rem;
  font-weight: 600;
}

.year {
  font-size: 0.85rem;
  opacity: 0.8;
}

.date-detail {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  color: white;
  background: rgba(255, 255, 255, 0.15);
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  backdrop-filter: blur(4px);
}

.detail-date {
  font-size: 0.9rem;
  font-weight: 600;
}

.detail-range {
  font-size: 0.75rem;
  opacity: 0.9;
  margin-top: 0.25rem;
}

/* 时间线标记 */
.timeline-marker {
  width: 40px;
  flex-shrink: 0;
  display: flex;
  justify-content: center;
  padding-top: 1rem;
}

.node-dot {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: white;
  border: 3px solid #667eea;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #667eea;
  font-size: 0.7rem;
  font-weight: bold;
  z-index: 10;
  transition: all 0.3s ease;
}

.node-dot.range {
  width: 28px;
  height: 28px;
  border-color: #f59e0b;
  color: #f59e0b;
}

.node-dot.allday {
  border-color: #4ade80;
  color: #4ade80;
}

.timeline-item:hover .node-dot {
  transform: scale(1.2);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.5);
}
</style>
