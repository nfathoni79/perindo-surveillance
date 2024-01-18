<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { GoogleMap, Marker, Polyline } from 'vue3-google-map'
import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/vue'
import { ChevronUpIcon } from '@heroicons/vue/24/solid'

import FishonService from '../services/FishonService'
import shipImg from '../assets/img/ps-ship.png'
import { formatDateTime } from '../utils'

const mapRef = ref(null)
const mapApiKey = import.meta.env.VITE_GMAP_API_KEY || ''

// Fetched data
const userSelections = ref([])
const deviceSelections = ref([])
const users = ref([])

// Form fields
const selectedUserId = ref(null)
const selectedDeviceId = ref(null)
const selectedDate = ref(new Date().toISOString().substring(0, 10))

/**
 * Ship icon for Markers.
 */
const shipIcon = computed(() => {
  return !mapRef.value?.ready
    ? null
    : {
      url: shipImg,
      scaledSize: new mapRef.value.api.Size(32, 32),
    }
})

/**
 * Arrow icon for Polylines.
 */
const arrowIcon = computed(() => {
  return !mapRef.value?.ready
    ? null
    : {
      path: mapRef.value.api.SymbolPath.FORWARD_CLOSED_ARROW,
    }
})

const defaultPolylineOptions = {
  path: [],
  geodesic: true,
  strokeColor: '#0088ff',
  strokeOpacity: 1.0,
  strokeWeight: 2,
}

const arrowPolylineOptions = computed(() => {
  if (arrowIcon.value == null) return defaultPolylineOptions

  let options = { ...defaultPolylineOptions }
  options.icons = [
    {
      icon: arrowIcon.value,
      offset: '100%',
    },
  ]

  return options
})

const userPolylineOptionsList = computed(() => {
  return users.value.map(user => {
    let options = { ...arrowPolylineOptions.value }
    options.path = user.positions.map(pos => {
      return { lat: pos.lat, lng: pos.lng }
    })

    return options
  })
})

const shipMarkerOptions = computed(() => {
  if (shipIcon.value == null) return { position: { lat: 0, lng: 0 } }

  return {
    position: { lat: 0, lng: 0 },
    icon: shipIcon.value,
  }
})

const userMarkerOptionsList = computed(() => {
  let optionsList = []
  
  for (const user of users.value) {
    for (const pos of user.positions) {
      let options = { ...shipMarkerOptions.value }
      options.position = { lat: pos.lat, lng: pos.lng }
      options.title = `${user.name} \n${user.shipName} \n${formatDateTime(pos.createdAt)}`

      optionsList.push(options)
    }
  }

  return optionsList
})

watch(selectedUserId, newUserId => {
  if (newUserId != null) {
    const deviceId = userSelections.value.find(user => {
      return user.id == newUserId
    })?.deviceId

    selectedDeviceId.value = deviceId
  } else {
    selectedDeviceId.value = null
  } 
})

watch(selectedDeviceId, newDeviceId => {
  if (newDeviceId != null) {
    const userId = deviceSelections.value.find(device => {
      return device.id == newDeviceId
    })?.userId

    selectedUserId.value = userId
  } else {
    selectedUserId.value = null
  }
})

onMounted(() => {
  getUsers()
  getDevices()
  getUsersWithPositions()
})

const getUsers = () => {
  FishonService.getUsers()
    .then(response => {
      const rawUsers = response.data.users

      userSelections.value = rawUsers.map(user => {
        return {
          id: user.id,
          fullName: user.full_name,
          deviceId: user.ship_device,
        }
      })
    })
}

const getDevices = () => {
  FishonService.getDevices()
    .then(response => {
      const rawDevices = response.data.devices

      deviceSelections.value = rawDevices.map(device => {
        return {
          id: device.id,
          shipName: device.ship_name,
          userId: device.user,
        }
      })
    })
}

const getUsersWithPositions = () => {
  FishonService.getUsersWithPositions(
      selectedUserId.value || '',
      selectedDeviceId.value || '',
      selectedDate.value || '')
    .then(response => {
      const rawUsers = response.data.users

      users.value = rawUsers.map(user => {
        return {
          name: user.full_name,
          shipName: user.ship_device?.ship_name || '-',
          positions: user.positions.map(pos => {
            return {
              lat: parseFloat(pos.lat),
              lng: parseFloat(pos.lon),
              createdAt: pos.created_at,
            }
          })
        }
      })
    })
}
</script>

<template>
  <div class="relative h-[calc(100vh-5rem)]">
    <GoogleMap ref="mapRef" :apiKey="mapApiKey"
      style="width: 100%; height: 100%; position: absolute;"
      :center="{ lat: -6.073600, lng: 106.742505 }" :zoom="10">
      <Marker v-for="(options, index) in userMarkerOptionsList" :key="index"
        :options="options" />

      <Polyline v-for="(options, index) in userPolylineOptionsList" :key="index"
        :options="options" />
    </GoogleMap>

    <!-- Filter menu -->
    <div class="absolute left-4 bottom-8 w-96
      rounded-lg shadow-lg bg-white p-2">
      <Disclosure v-slot="{ open }">
        <DisclosureButton class="flex w-full justify-between rounded-lg
          bg-cyan-100 hover:bg-cyan-200 px-4 py-2
          font-medium text-cyan-900 focus:outline-none
          focus-visible:ring focus-visible:ring-cyan-500/75">
          <span>Filter</span>
          <ChevronUpIcon :class="['h-6 w-6 text-cyan-500',
            open ? 'rotate-180 transform' : '']" />
        </DisclosureButton>

        <DisclosurePanel class="p-4">
          <form @submit.prevent="" class="flex flex-col gap-4">
            <label class="block">
              <span class="text-gray-800">Pengguna</span>
              <select v-model="selectedUserId" @change="getUsersWithPositions()"
                class="mt-1 block w-full border border-gray-400
                rounded-lg shadow-sm px-4 py-2 
                text-gray-800 focus:ring-cyan-600">
                <option :value="null">Semua</option>
                <option v-for="user in userSelections" :key="user.id"
                  :value="user.id">
                  {{ user.fullName }}
                </option>
              </select>
            </label>

            <label class="block">
              <span class="text-gray-800">Kapal</span>
              <select v-model="selectedDeviceId" @change="getUsersWithPositions()"
                class="mt-1 block w-full border border-gray-400
                rounded-lg shadow-sm px-4 py-2 
                text-gray-800 focus:ring-cyan-600">
                <option :value="null">Semua</option>
                <option v-for="device in deviceSelections" :key="device.id"
                  :value="device.id">
                  {{ device.shipName }}
                </option>
              </select>
            </label>

            <label class="block">
              <span class="text-gray-800">Tanggal</span>
              <input type="date"
                v-model="selectedDate" @change="getUsersWithPositions()"
                class="mt-1 block w-full border border-gray-400
                rounded-lg shadow-sm px-4 py-2
                text-gray-800 focus:ring-cyan-600" />
            </label>
          </form>
        </DisclosurePanel>
      </Disclosure>
    </div>
  </div>
</template>