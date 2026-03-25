import { ref, computed } from 'vue'
import { format, parseISO, isValid, isSameDay, isWithinInterval, compareAsc } from 'date-fns'

export interface TimelineFrame {
  id: string
  personId: string
  content: string
  images?: string[]
}

export interface TimelineNode {
  id: string
  date: string
  endDate?: string
  type: 'point' | 'range'
  title: string
  frames: TimelineFrame[]
}

export function useTimeline() {
  const nodes = ref<TimelineNode[]>([])
  const loading = ref(false)
  const selectedPersonId = ref<string | null>(null)
  
  const sortedNodes = computed(() => {
    return [...nodes.value].sort((a, b) => {
      return compareAsc(parseISO(a.date), parseISO(b.date))
    })
  })
  
  const filteredNodes = computed(() => {
    if (!selectedPersonId.value) return sortedNodes.value
    
    return sortedNodes.value.filter(node => 
      node.frames.some(frame => frame.personId === selectedPersonId.value)
    )
  })
  
  const fetchNodes = async () => {
    loading.value = true
    try {
      const response = await fetch('/timeline/data/timeline.json')
      const data = await response.json()
      nodes.value = data.nodes || []
    } catch (error) {
      console.error('Failed to fetch timeline:', error)
    } finally {
      loading.value = false
    }
  }
  
  const formatDate = (dateStr: string) => {
    const date = parseISO(dateStr)
    if (!isValid(date)) return dateStr
    return format(date, 'yyyy年MM月dd日')
  }
  
  const formatDateRange = (startDate: string, endDate?: string) => {
    if (!endDate) return formatDate(startDate)
    return `${formatDate(startDate)} - ${formatDate(endDate)}`
  }
  
  const isToday = (dateStr: string) => {
    const date = parseISO(dateStr)
    return isValid(date) && isSameDay(date, new Date())
  }
  
  const isInRange = (dateStr: string, startDate: string, endDate?: string) => {
    if (!endDate) return isSameDay(parseISO(dateStr), parseISO(startDate))
    const date = parseISO(dateStr)
    return isWithinInterval(date, {
      start: parseISO(startDate),
      end: parseISO(endDate)
    })
  }
  
  return {
    nodes,
    loading,
    selectedPersonId,
    sortedNodes,
    filteredNodes,
    fetchNodes,
    formatDate,
    formatDateRange,
    isToday,
    isInRange
  }
}
