import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import People from '../views/People.vue'
import About from '../views/About.vue'

const router = createRouter({
  history: createWebHistory('/timeline/'),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/people',
      name: 'people',
      component: People
    },
    {
      path: '/about',
      name: 'about',
      component: About
    }
  ]
})

export default router
