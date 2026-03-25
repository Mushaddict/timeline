<template>
  <div class="login-page">
    <div class="login-container">
      <div class="logo-section">
        <div class="logo">⏳</div>
        <h1>Timeline</h1>
        <p>记录生活中的每一个重要时刻</p>
      </div>
      
      <div class="login-form">
        <div class="form-group">
          <input
            v-model="password"
            type="password"
            placeholder="请输入密码"
            @keyup.enter="handleLogin"
            :disabled="isLoading"
          />
          <span class="input-icon">🔒</span>
        </div>
        
        <button 
          class="login-btn"
          @click="handleLogin"
          :disabled="!password || isLoading"
        >
          <span v-if="isLoading">验证中...</span>
          <span v-else>进入时光轴</span>
        </button>
        
        <p v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </p>
      </div>
      
      
    </div>
    
    <!-- 装饰元素 -->
    <div class="bg-decoration">
      <div class="circle c1"></div>
      <div class="circle c2"></div>
      <div class="circle c3"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'

const router = useRouter()
const { login, isAdmin } = useAuth()

const password = ref('')
const isLoading = ref(false)
const errorMessage = ref('')

const handleLogin = () => {
  if (!password.value) return
  
  isLoading.value = true
  errorMessage.value = ''
  
  // 模拟验证延迟
  setTimeout(() => {
    const success = login(password.value)
    
    if (success) {
      // 根据权限跳转到不同页面
      if (isAdmin.value) {
        router.push('/')
      } else {
        router.push('/events')
      }
    } else {
      errorMessage.value = '密码错误，请重新输入'
    }
    
    isLoading.value = false
  }, 500)
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  overflow: hidden;
}

.login-container {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 24px;
  padding: 3rem;
  width: 90%;
  max-width: 420px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
  z-index: 10;
}

.logo-section {
  text-align: center;
  margin-bottom: 2.5rem;
}

.logo {
  font-size: 4rem;
  margin-bottom: 1rem;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.logo-section h1 {
  font-size: 2rem;
  color: #333;
  margin-bottom: 0.5rem;
  font-weight: 700;
}

.logo-section p {
  color: #666;
  font-size: 1rem;
}

.login-form {
  margin-bottom: 2rem;
}

.form-group {
  position: relative;
  margin-bottom: 1.5rem;
}

.form-group input {
  width: 100%;
  padding: 1rem 1rem 1rem 3rem;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  font-size: 1rem;
  transition: all 0.3s;
  background: white;
}

.form-group input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
}

.form-group input:disabled {
  background: #f5f5f5;
  cursor: not-allowed;
}

.input-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  font-size: 1.2rem;
  opacity: 0.5;
}

.login-btn {
  width: 100%;
  padding: 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.login-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.5);
}

.login-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error-message {
  color: #e74c3c;
  text-align: center;
  margin-top: 1rem;
  font-size: 0.9rem;
  padding: 0.75rem;
  background: rgba(231, 76, 60, 0.1);
  border-radius: 8px;
  animation: shake 0.5s ease;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

.hint-section {
  padding-top: 1.5rem;
  border-top: 1px solid #eee;
}

.hint-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
  font-size: 0.85rem;
  color: #666;
}

.hint-item:last-child {
  margin-bottom: 0;
}

.hint-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.hint-dot.guest {
  background: #4ade80;
}

.hint-dot.full {
  background: #667eea;
}

/* 背景装饰 */
.bg-decoration {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  pointer-events: none;
}

.circle {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
}

.c1 {
  width: 300px;
  height: 300px;
  top: -150px;
  right: -100px;
  animation: drift 20s ease-in-out infinite;
}

.c2 {
  width: 200px;
  height: 200px;
  bottom: -50px;
  left: -50px;
  animation: drift 25s ease-in-out infinite reverse;
}

.c3 {
  width: 150px;
  height: 150px;
  top: 50%;
  left: 20%;
  animation: drift 30s ease-in-out infinite;
}

@keyframes drift {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(30px, -30px) scale(1.1); }
  66% { transform: translate(-20px, 20px) scale(0.9); }
}
</style>
