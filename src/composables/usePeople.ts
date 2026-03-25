import { ref, computed } from 'vue'
import { parseISO, differenceInYears } from 'date-fns'
import { useZodiac } from './useZodiac'

export interface Person {
  id: string
  name: string
  birthday: string
  zodiac?: string
  avatar?: string
  meetDate?: string
  memo?: string
  timelineIds?: string[]
}

const { getZodiac } = useZodiac()

// 检测是否在本地开发环境（有后端服务器）
const isLocalDev = () => {
  return window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
}

export function usePeople() {
  const people = ref<Person[]>([])
  const loading = ref(false)
  const saving = ref(false)
  const saveMessage = ref('')
  
  const peopleWithAge = computed(() => {
    return people.value.map(person => {
      const age = person.birthday 
        ? differenceInYears(new Date(), parseISO(person.birthday))
        : null
      const zodiacInfo = getZodiac(person.birthday)
      
      return {
        ...person,
        age,
        zodiac: zodiacInfo?.name || person.zodiac
      }
    })
  })
  
  const fetchPeople = async () => {
    loading.value = true
    try {
      // 本地开发时优先从 API 获取
      const url = isLocalDev() ? 'http://localhost:3001/api/people' : '/timeline/data/people.json'
      const response = await fetch(url)
      const data = await response.json()
      people.value = data.people || []
    } catch (error) {
      console.error('Failed to fetch people:', error)
      // 如果 API 失败，尝试从静态文件获取
      try {
        const response = await fetch('/timeline/data/people.json')
        const data = await response.json()
        people.value = data.people || []
      } catch (e) {
        console.error('Failed to fetch from static file:', e)
      }
    } finally {
      loading.value = false
    }
  }
  
  const savePeople = async () => {
    if (!isLocalDev()) {
      saveMessage.value = '保存功能仅在本地开发环境可用'
      return false
    }
    
    saving.value = true
    saveMessage.value = ''
    
    try {
      const response = await fetch('http://localhost:3001/api/people', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ people: people.value })
      })
      
    if (!response.ok) throw new Error('Save failed')
    
    await response.json()
    saveMessage.value = '✅ 已保存到文件'
      
      // 3秒后清除消息
      setTimeout(() => {
        saveMessage.value = ''
      }, 3000)
      
      return true
    } catch (error) {
      console.error('Failed to save people:', error)
      saveMessage.value = '❌ 保存失败，请确保后端服务器已启动 (npm run server)'
      return false
    } finally {
      saving.value = false
    }
  }
  
  const backupData = async () => {
    if (!isLocalDev()) return false
    
    try {
      const response = await fetch('http://localhost:3001/api/backup', {
        method: 'POST'
      })
      
      if (!response.ok) throw new Error('Backup failed')
      
      saveMessage.value = '💾 已创建备份'
      setTimeout(() => {
        saveMessage.value = ''
      }, 3000)
      
      return true
    } catch (error) {
      console.error('Failed to backup:', error)
      return false
    }
  }
  
  const getPersonById = (id: string) => {
    return people.value.find(p => p.id === id)
  }
  
  const getPersonName = (id: string) => {
    const person = getPersonById(id)
    return person?.name || '未知'
  }
  
  const addPerson = async (person: Omit<Person, 'id'>) => {
    const newPerson: Person = {
      ...person,
      id: `p${Date.now()}`,
      zodiac: getZodiac(person.birthday)?.name
    }
    people.value.push(newPerson)
    return newPerson
  }
  
  const updatePerson = async (id: string, updates: Partial<Person>) => {
    const index = people.value.findIndex(p => p.id === id)
    if (index === -1) return null
    
    if (updates.birthday) {
      updates.zodiac = getZodiac(updates.birthday)?.name
    }
    
    people.value[index] = { ...people.value[index], ...updates }
    return people.value[index]
  }
  
  const deletePerson = async (id: string) => {
    const index = people.value.findIndex(p => p.id === id)
    if (index === -1) return false
    people.value.splice(index, 1)
    return true
  }
  
  return {
    people,
    peopleWithAge,
    loading,
    saving,
    saveMessage,
    fetchPeople,
    savePeople,
    backupData,
    getPersonById,
    getPersonName,
    addPerson,
    updatePerson,
    deletePerson
  }
}
