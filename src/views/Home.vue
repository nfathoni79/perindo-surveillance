<script setup>
import { ref, computed, onMounted } from 'vue'
import { GoogleMap, Marker, Polyline } from 'vue3-google-map'

import FishonService from '../services/FishonService'
import shipImg from '../assets/img/ps-ship.png'
import { formatDateTime } from '../utils'

const mapRef = ref(null)
const mapApiKey = import.meta.env.VITE_GMAP_API_KEY || ''

const users = ref([])

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

onMounted(() => {
  getUsersWithPositions()
})

const getUsersWithPositions = () => {
  FishonService.getUsersWithPositions()
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
  <div class="h-screen">
    <GoogleMap ref="mapRef" :apiKey="mapApiKey"
      style="width: 100%; height: 100%; position: absolute;"
      :center="{ lat: -6.073600, lng: 106.742505 }" :zoom="10">
      <Marker v-for="(options, index) in userMarkerOptionsList" :key="index"
        :options="options" />

      <Polyline v-for="(options, index) in userPolylineOptionsList" :key="index"
        :options="options" />
    </GoogleMap>
  </div>
</template>