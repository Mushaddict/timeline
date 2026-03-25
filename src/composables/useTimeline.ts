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
  isAllDay?: boolean
  type: 'point' | 'range'
  title: string
  happened: string
  thought?: string
  note?: string
  frames: TimelineFrame[]
}

export function useTimeline() {
  const nodes = ref<TimelineNode[]>([])
  const loading = ref(false)
  const saving = ref(false)
  const saveMessage = ref('')
  const selectedPersonId = ref<string | null>(null)

  // 检测是否在本地开发环境
  const isLocalDev = () => {
    return window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  }

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
      // 本地开发时优先从 API 获取
      const url = isLocalDev() ? 'http://localhost:3001/api/timeline' : '/timeline/data/timeline.json'
      const response = await fetch(url)
      const data = await response.json()
      nodes.value = data.nodes || []
    } catch (error) {
      console.error('Failed to fetch timeline:', error)
      // 如果 API 失败，尝试从静态文件获取
      try {
        const response = await fetch('/timeline/data/timeline.json')
        const data = await response.json()
        nodes.value = data.nodes || []
      } catch (e) {
        console.error('Failed to fetch from static file:', e)
      }
    } finally {
      loading.value = false
    }
  }

  const saveNodes = async () => {
    if (!isLocalDev()) {
      saveMessage.value = '保存功能仅在本地开发环境可用'
      return false
    }

    saving.value = true
    saveMessage.value = ''

    try {
      const response = await fetch('http://localhost:3001/api/timeline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nodes: nodes.value })
      })

      if (!response.ok) throw new Error('Save failed')

      await response.json()
      saveMessage.value = '✅ 已保存到文件'

      setTimeout(() => {
        saveMessage.value = ''
      }, 3000)

      return true
    } catch (error) {
      console.error('Failed to save timeline:', error)
      saveMessage.value = '❌ 保存失败，请确保后端服务器已启动 (npm run server)'
      return false
    } finally {
      saving.value = false
    }
  }

  const addNode = async (node: Omit<TimelineNode, 'id'>) => {
    const newNode: TimelineNode = {
      ...node,
      id: `t${Date.now()}`,
      frames: node.frames || []
    }
    nodes.value.push(newNode)
    return newNode
  }

  const updateNode = async (id: string, updates: Partial<TimelineNode>) => {
    const index = nodes.value.findIndex(n => n.id === id)
    if (index === -1) return null

    nodes.value[index] = { ...nodes.value[index], ...updates }
    return nodes.value[index]
  }

  const deleteNode = async (id: string) => {
    const index = nodes.value.findIndex(n => n.id === id)
    if (index === -1) return false
    nodes.value.splice(index, 1)
    return true
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
    saving,
    saveMessage,
    selectedPersonId,
    sortedNodes,
    filteredNodes,
    fetchNodes,
    saveNodes,
    addNode,
    updateNode,
    deleteNode,
    formatDate,
    formatDateRange,
    isToday,
    isInRange
  }
}
