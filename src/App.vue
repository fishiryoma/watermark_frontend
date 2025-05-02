<template>
  <v-app>
    <v-card variant="tonal" color="blue-grey-lighten-1" class="py-4 text-center">
      <h1 style="letter-spacing: 2px">WaterMaker</h1>
    </v-card>
    <v-main>
      <Watermark />
    </v-main>
    <v-footer class="d-flex justify-center text-body-2" color="blue-grey-darken-1"
      >2025 - VUE PROJECT -
    </v-footer>
  </v-app>
</template>
<script setup>
import Watermark from './components/Watermark.vue'
</script>

<style></style>
