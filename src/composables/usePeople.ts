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

export function usePeople() {
  const people = ref<Person[]>([])
  const loading = ref(false)
  
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
      const response = await fetch('/timeline/data/people.json')
      const data = await response.json()
      people.value = data.people || []
    } catch (error) {
      console.error('Failed to fetch people:', error)
    } finally {
      loading.value = false
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
    fetchPeople,
    getPersonById,
    getPersonName,
    addPerson,
    updatePerson,
    deletePerson
  }
}
