import { createRouter, createWebHistory } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import Home from '../views/Home.vue'
import People from '../views/People.vue'
import Events from '../views/Events.vue'
import About from '../views/About.vue'
import Login from '../views/Login.vue'

const router = createRouter({
  history: createWebHistory('/timeline/'),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: Login,
      meta: { public: true }
    },
    {
      path: '/',
      name: 'home',
      component: Home,
      meta: { requiresAuth: true }
    },
    {
      path: '/people',
      name: 'people',
      component: People,
      meta: { requiresAuth: true, requiresAdmin: true }
    },
    {
      path: '/events',
      name: 'events',
      component: Events,
      meta: { requiresAuth: true }
    },
    {
      path: '/about',
      name: 'about',
      component: About,
      meta: { requiresAuth: true }
    }
  ]
})

// 路由守卫
router.beforeEach((to, _from, next) => {
  const { isLoggedIn, canViewPeople } = useAuth()
  
  // 如果已经登录，访问登录页则跳转到首页
  if (to.path === '/login' && isLoggedIn.value) {
    next('/')
    return
  }
  
  // 公开页面直接放行
  if (to.meta.public) {
    next()
    return
  }
  
  // 需要登录但未登录，跳转到登录页
  if (to.meta.requiresAuth && !isLoggedIn.value) {
    next('/login')
    return
  }
  
  // 需要管理员权限但无权限，跳转到事件页
  if (to.meta.requiresAdmin && !canViewPeople.value) {
    next('/events')
    return
  }
  
  next()
})

export default router
