import { ref, computed } from 'vue'

type UserRole = 'guest' | 'event-only' | 'admin'

interface AuthState {
  isLoggedIn: boolean
  role: UserRole
  password: string
}

const authState = ref<AuthState>({
  isLoggedIn: false,
  role: 'guest',
  password: ''
})

// 简单的密码验证
const validatePassword = (password: string): UserRole => {
  // 事件查看权限密码
  if (password === '8888') {
    return 'event-only'
  }
  
  // 管理员权限密码 - 包含特定字符串
  if (password.includes('600387979')) {
    return 'admin'
  }
  
  return 'guest'
}

export function useAuth() {
  const isLoggedIn = computed(() => authState.value.isLoggedIn)
  const userRole = computed(() => authState.value.role)
  const isAdmin = computed(() => authState.value.role === 'admin')
  const isEventOnly = computed(() => authState.value.role === 'event-only')
  
  const login = (password: string): boolean => {
    const role = validatePassword(password)
    
    if (role !== 'guest') {
      authState.value = {
        isLoggedIn: true,
        role,
        password
      }
      return true
    }
    
    return false
  }
  
  const logout = () => {
    authState.value = {
      isLoggedIn: false,
      role: 'guest',
      password: ''
    }
  }
  
  const canViewPeople = computed(() => authState.value.role === 'admin')
  const canViewEvents = computed(() => 
    authState.value.role === 'admin' || authState.value.role === 'event-only'
  )
  
  return {
    isLoggedIn,
    userRole,
    isAdmin,
    isEventOnly,
    login,
    logout,
    canViewPeople,
    canViewEvents
  }
}
