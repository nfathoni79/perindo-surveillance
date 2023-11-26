import { createWebHistory, createRouter } from 'vue-router'
import Base from '../views/Base.vue'
import Login from '../views/Login.vue'
import Home from '../views/Home.vue'
import NotFound from '../views/NotFound.vue'

import FishonService from '../services/FishonService'

/**
 * Check if user is logged in or not.
 * @returns {boolean} True if user is logged in
 */
const isUserLoggedIn = async () => {
  if (localStorage.getItem('fishonToken') == null) {
    return false
  }

  try {
    await FishonService.getCurrentUser()
    return true
  } catch (error) {
    return false
  }
}

const routes = [
  {
    path: '/',
    name: 'base',
    component: Base,
    beforeEnter: async (to, from, next) => {
      if (await isUserLoggedIn()) {
        next()
      } else {
        next({ name: 'login' })
      }
    },
    children: [
      {
        path: '',
        name: 'home',
        component: Home,
      },
    ],
  },
  {
    path: '/login',
    name: 'login',
    component: Login,
  },
  {
    path: '/:catchAll(.*)*',
    name: 'not-found',
    component: NotFound,
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router