<template>
  <div class="timeline">
    <div v-if="loading" class="loading">加载中...</div>
    
    <div v-else-if="nodes.length === 0" class="empty">
      还没有时间记录，快去添加一些吧！
    </div>
    
    <div v-else class="timeline-container">
      <div class="timeline-line"></div>
      
      <div 
        v-for="(node, index) in nodes" 
        :key="node.id"
        class="timeline-item"
        :class="{ 'left': index % 2 === 0, 'right': index % 2 === 1 }"
      >
        <TimelineNode 
          :node="node"
          :position="index % 2 === 0 ? 'left' : 'right'"
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
  
  items.forEach((item, index) => {
    const xOffset = index % 2 === 0 ? -50 : 50
    
    gsap.fromTo(item, 
      { 
        opacity: 0, 
        x: xOffset 
      },
      {
        opacity: 1,
        x: 0,
        duration: 0.6,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: item,
          start: 'top 80%',
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
}

.timeline-line {
  position: absolute;
  left: 50%;
  top: 0;
  bottom: 0;
  width: 4px;
  background: linear-gradient(to bottom, rgba(255,255,255,0.3), rgba(255,255,255,0.6), rgba(255,255,255,0.3));
  transform: translateX(-50%);
  transform-origin: top;
  border-radius: 2px;
}

.timeline-item {
  position: relative;
  margin-bottom: 3rem;
  display: flex;
  align-items: flex-start;
}

.timeline-item.left {
  justify-content: flex-start;
  padding-right: 50%;
}

.timeline-item.right {
  justify-content: flex-end;
  padding-left: 50%;
}

@media (max-width: 768px) {
  .timeline-line {
    left: 20px;
  }
  
  .timeline-item.left,
  .timeline-item.right {
    justify-content: flex-start;
    padding-left: 50px;
    padding-right: 0;
  }
}
</style>
