<template>
  <div class="home">
    <div class="hero">
      <h1>时光轴</h1>
      <p>记录生活中的每一个重要时刻</p>
    </div>

    <Timeline
      :nodes="allNodes"
      :loading="loading"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import Timeline from '../components/Timeline.vue'
import { useTimeline, type TimelineNode } from '../composables/useTimeline'
import { usePeople, type Person } from '../composables/usePeople'
import { parseISO, compareAsc, format, isValid } from 'date-fns'
import type { TimeRange } from '../composables/usePeople'

// 格式化时间段日期
const formatRangeDate = (range: TimeRange): string => {
  const start = parseISO(range.startDate)
  const startStr = isValid(start) ? format(start, 'yyyy.MM.dd') : range.startDate

  if (range.endDate === 'present') {
    return `${startStr} - 至今`
  }

  if (range.endDate) {
    const end = parseISO(range.endDate)
    const endStr = isValid(end) ? format(end, 'yyyy.MM.dd') : range.endDate
    return `${startStr} - ${endStr}`
  }

  return startStr
}

const { loading: timelineLoading, fetchNodes, sortedNodes } = useTimeline()
const { people, fetchPeople } = usePeople()

const loading = computed(() => timelineLoading.value)

// 将人物的时间段转换为时间轴节点
const convertTimeRangesToNodes = (peopleList: Person[]): TimelineNode[] => {
  const nodes: TimelineNode[] = []

  peopleList.forEach(person => {
    if (person.timeRanges && person.timeRanges.length > 0) {
      person.timeRanges.forEach(range => {
        const node: TimelineNode = {
          id: `tr-${range.id}`,
          date: person.meetDate || range.startDate,
          endDate: undefined,
          type: 'point',
          title: person.name,
          happened: `${range.title} (${formatRangeDate(range)})`,
          frames: [{
            id: `frame-${range.id}`,
            personId: person.id,
            content: range.description || `${range.title} (${formatRangeDate(range)})`,
            images: []
          }]
        }
        nodes.push(node)
      })
    }
  })

  return nodes
}

// 合并时间轴节点和人物时间段，并按日期排序
const allNodes = computed(() => {
  const timelineNodes = sortedNodes.value || []
  const personRangeNodes = convertTimeRangesToNodes(people.value)

  const combined = [...timelineNodes, ...personRangeNodes]

  // 按日期排序
  return combined.sort((a, b) => {
    return compareAsc(parseISO(a.date), parseISO(b.date))
  })
})

onMounted(() => {
  fetchNodes()
  fetchPeople()
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
