<template>
  <div class="app">
    <nav v-if="isLoggedIn" class="navbar">
      <div class="nav-brand">
        <router-link to="/">Timeline</router-link>
      </div>
      <div class="nav-section">
        <div class="nav-links">
          <router-link to="/">时间轴</router-link>
          <router-link to="/events">事件</router-link>
          <router-link v-if="canViewPeople" to="/people">人物</router-link>
          <router-link to="/about">关于</router-link>
        </div>
        <div class="user-section">
          <span class="role-badge" :class="userRole">
            {{ roleDisplayName }}
          </span>
          <button class="logout-btn" @click="handleLogout">
            退出
          </button>
        </div>
      </div>
    </nav>
    <main :class="['main-content', { 'full-height': !isLoggedIn }]">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuth } from './composables/useAuth'
import { computed } from 'vue'

const router = useRouter()
const { isLoggedIn, userRole, canViewPeople, logout } = useAuth()

const roleDisplayName = computed(() => {
  switch (userRole.value) {
    case 'admin':
      return '管理员'
    case 'event-only':
      return '访客'
    default:
      return ''
  }
})

const handleLogout = () => {
  logout()
  router.push('/login')
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
}

.app {
  min-height: 100vh;
}

.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-brand a {
  font-size: 1.5rem;
  font-weight: bold;
  color: white;
  text-decoration: none;
}

.nav-section {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.nav-links {
  display: flex;
  gap: 1rem;
}

.nav-links a {
  color: rgba(255, 255, 255, 0.9);
  text-decoration: none;
  transition: all 0.3s;
  padding: 0.5rem 1rem;
  border-radius: 8px;
}

.nav-links a:hover,
.nav-links a.router-link-active {
  color: white;
  background: rgba(255, 255, 255, 0.2);
}

.user-section {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding-left: 1rem;
  border-left: 1px solid rgba(255, 255, 255, 0.2);
}

.role-badge {
  padding: 0.3rem 0.8rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
}

.role-badge.admin {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.role-badge.event-only {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.logout-btn {
  padding: 0.4rem 1rem;
  background: rgba(255, 255, 255, 0.15);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 6px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.3s;
}

.logout-btn:hover {
  background: rgba(255, 255, 255, 0.25);
}

.main-content {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.main-content.full-height {
  max-width: none;
  margin: 0;
  padding: 0;
  min-height: 100vh;
}
</style>
