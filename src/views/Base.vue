<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  UserIcon,
  PowerIcon,
} from '@heroicons/vue/24/outline'

import AButton from '../components/AButton.vue'
import FishonService from '../services/FishonService'

const router = useRouter()
const route = useRoute()

const user = ref(null)

const navs = [
  { name: 'Map', routeName: 'map' },
  { name: 'CCTV', routeName: 'cctv' },
]

onMounted(() => {
  getCurrentUser()
})

/**
 * Get current user.
 */
 const getCurrentUser = () => {
  FishonService.getCurrentUser()
    .then(response => {
      const groups = response.data.data.profil.groups
      const groupName = groups[0].name

      user.value = {
        name: response.data.data.profil.full_name,
        group: groupName,
      }
    })
    .catch(error => {
      if (error.response.status == 401 && route.name != 'home') {
        router.push({ name: 'login' })
      }
    })
}

/**
 * Check if nav menu is active based on the current route.
 * @param {string} routeName - Nav route name.
 */
 const isMenuActive = (routeName) => {
  return route.name.startsWith(routeName)
}

/**
 * Log user out. Remove token from local storage.
 */
 const logout = () => {
  FishonService.logout()
  router.push({ name: 'login' })
}
</script>

<template>
  <div class="min-h-screen">
    <nav class="h-20 bg-cyan-50 z-50 shadow-lg px-4 flex">
      <div class="mx-auto max-w-7xl w-full flex items-center justify-between">
        <!-- Logo -->
        <div>
          <router-link :to="{ name: 'home' }">
            <img class="h-10" src="../assets/img/ps-logo.png"
              alt="Perindo Surveillance" />
          </router-link>
        </div>

        <!-- Navs -->
        <div v-if="user" class="flex gap-4">
          <router-link v-for="nav in navs" :key="nav.routeName"
            :to="{ name: nav.routeName }"
            :class="[isMenuActive(nav.routeName)
            ? 'font-semibold underline underline-offset-4 decoration-2'
            : 'font-medium', 'text-cyan-600 hover:text-cyan-700']">
            {{ nav.name }}
          </router-link>
        </div>

        <!-- User info -->
        <div v-if="user"
          class="flex items-center gap-2 text-cyan-600 font-semibold">
          <UserIcon class="h-6 w-6" />
          <div>{{ user?.name }}</div>
          <AButton color="red" :rounded="true" @click="logout()">
            <PowerIcon class="h-4 w-4" />
          </AButton>
        </div>
        <div v-else>
          <router-link :to="{ name: 'login' }"
            class="font-medium text-cyan-600 hover:text-cyan-700">
            Login
          </router-link>
        </div>
      </div>
    </nav>

    <router-view :user="user" />
  </div>
</template>