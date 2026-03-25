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
      >
        <TimelineNode
          :node="node"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import TimelineNode from './TimelineNode.vue'
import type { TimelineNode as TimelineNodeType } from '../composables/useTimeline'

gsap.registerPlugin(ScrollTrigger)

interface Props {
  nodes: TimelineNodeType[]
  loading?: boolean
}

defineProps<Props>()

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
  max-width: 800px;
  margin: 0 auto;
}

.timeline-line {
  position: absolute;
  left: 20px;
  top: 0;
  bottom: 0;
  width: 4px;
  background: linear-gradient(to bottom, rgba(255,255,255,0.3), rgba(255,255,255,0.6), rgba(255,255,255,0.3));
  transform-origin: top;
  border-radius: 2px;
}

.timeline-item {
  position: relative;
  margin-bottom: 2rem;
  padding-left: 50px;
}

.timeline-item:last-child {
  margin-bottom: 0;
}
</style>
