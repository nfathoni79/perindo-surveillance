<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  UserIcon,
  PowerIcon,
} from '@heroicons/vue/24/outline'

import AButton from '../components/AButton.vue'
import FishonService from '../services/FishonService'

const router = useRouter()
const user = ref(null)

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
      if (error.response.status == 401) {
        router.push({ name: 'login' })
      }
    })
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
  <div class="relative">
    <nav class="fixed inset-x-0 h-20 bg-cyan-50 z-50 shadow-lg
      flex flex-col justify-center">
      <div class="mx-auto max-w-7xl w-full flex items-center justify-between">
        <!-- Logo -->
        <div>
          <router-link :to="{ name: 'home' }">
            <img class="h-10" src="../assets/img/ps-logo.png"
              alt="Perindo Surveillance" />
          </router-link>
        </div>

        <!-- User info -->
        <div class="flex items-center gap-2 text-cyan-600 font-semibold">
          <UserIcon class="h-6 w-6" />
          <div>{{ user?.name }}</div>
          <AButton color="red" :rounded="true" @click="logout()">
            <PowerIcon class="h-4 w-4" />
          </AButton>
        </div>
      </div>
    </nav>

    <router-view :user="user" />
  </div>
</template>