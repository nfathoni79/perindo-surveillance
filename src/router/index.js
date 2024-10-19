import { createWebHistory, createRouter } from 'vue-router'
import Base from '../views/Base.vue'
import Home from '../views/Home.vue'
import Map from '../views/Map.vue'
import Cctv from '../views/Cctv.vue'
import CctvOnline from '../views/CctvOnline.vue'
import Login from '../views/Login.vue'
import NotFound from '../views/NotFound.vue'

import FishonService from '../services/FishonService'

/**
 * Check if user is logged in or not before entering a route.
 * @param {*} to - Target route.
 * @param {*} from - Current route.
 * @param {*} next - Function to pass the next route.
 */
const checkIfAuthed = async (to, from, next) => {
  if (localStorage.getItem('fishonToken') == null) {
    next({ name: 'login' })
    return
  }

  try {
    await FishonService.getCurrentUser()
    next()
  } catch (error) {
    next({ name: 'login' })
  }
}

const routes = [
  {
    path: '/',
    name: 'base',
    component: Base,
    children: [
      {
        path: '',
        name: 'home',
        component: Home,
      },
      {
        path: 'map',
        name: 'map',
        component: Map,
        beforeEnter : checkIfAuthed,
      },
      {
        path: 'cctv',
        name: 'cctv',
        component: Cctv,
        beforeEnter : checkIfAuthed,
      },
      {
        path: 'cctvonline',
        name: 'cctvonline',
        component: CctvOnline,
        beforeEnter : checkIfAuthed,
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