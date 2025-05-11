<template>
  <v-form @submit.prevent="applyWatermark" class="pa-8">
    <v-file-input
      v-model="imageFile"
      label="Upload Image"
      accept="image/*"
      prepend-icon="mdi-camera"
      variant="outlined"
      show-size
      counter
      @change="handleUpload"
      class="mb-4"
    ></v-file-input>
    <v-text-field
      v-model="text"
      label="Watermark Text"
      prepend-icon="mdi-format-text"
      variant="outlined"
    ></v-text-field>
    <v-row>
      <v-col cols="6">
        <v-slider
          v-model="pX"
          label="x-position"
          prepend-icon="mdi-arrow-left-right-bold"
          :min="10"
          :max="maxPx"
          variant="outlined"
        ></v-slider>
      </v-col>
      <v-col cols="6">
        <v-slider
          v-model="pY"
          label="y-position"
          prepend-icon="mdi-arrow-up-down-bold"
          :min="minPy"
          :max="canvas.height"
        ></v-slider>
      </v-col>
    </v-row>
    <v-select
      v-model="fontSize"
      label="Font Size"
      prepend-icon="mdi-format-size"
      :items="fontSizeOptions"
      variant="outlined"
    ></v-select>
    <v-row class="pl-10">
      <v-col cols="auto">
        <v-color-picker v-model="fontColor" mode="hex"></v-color-picker>
      </v-col>
      <v-col>
        <img v-if="previewImg" :src="previewImg ?? ''" alt="preview" />
      </v-col>
    </v-row>
  </v-form>
</template>

<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from 'vue'
import type { Ref } from 'vue'

// font size setting
interface FontSizeOption {
  title: string
  value: number
}
const fontSizeOptions: FontSizeOption[] = [
  { title: '10px', value: 10 },
  { title: '12px', value: 12 },
  { title: '16px', value: 16 },
  { title: '24px', value: 24 },
  { title: '32px', value: 32 },
  { title: '36px', value: 36 },
  { title: '48px', value: 48 },
  { title: '64px', value: 64 },
  { title: '72px', value: 72 },
  { title: '96px', value: 96 },
]

// input
const imageFile: Ref<File | null> = ref(null)
// 為了實現PREVIEW REGION
const originImg: Ref<string | null> = ref(null)
const previewImg: Ref<string | null> = ref(null)
const text: Ref<string> = ref('')
const pX: Ref<number> = ref(10)
const pY: Ref<number> = ref(30)
const fontSize: Ref<number> = ref(36)
const fontColor: Ref<string> = ref('#FFF')
const loading: Ref<{ previewLoading: boolean; apiLoading: boolean }> = ref({
  previewLoading: false,
  apiLoading: false,
})

// methods
const handleUpload = (e: any) => {
  const file = e.target.files[0]
  if (file) {
    imageFile.value = file
    originImg.value = URL.createObjectURL(file)
  }
}

const canvas = document.createElement('canvas')
const ctx = canvas.getContext('2d')

const generateWatermark = () => {
  if (!originImg.value) return

  const img = new Image()
  img.src = originImg.value
  img.onload = () => {
    if (img.width !== canvas.width && img.height !== canvas.height) {
      canvas.width = img.width
      canvas.height = img.height
    }
    if (ctx) {
      ctx.drawImage(img, 0, 0)
      if (text.value) {
        ctx.font = `${fontSize.value}px Arial`
        ctx.fillStyle = fontColor.value
        ctx.fillText(text.value, pX.value, pY.value)
      }
    }
    previewImg.value = canvas.toDataURL('image/jpeg')
  }
  img.onerror = () => {
    console.error('Fail to load img')
    previewImg.value = null
  }
}

const getTextWidth = () => {
  if (!text.value || !ctx) return 0
  ctx.font = `${fontSize.value}px Arial`
  const metrics = ctx.measureText(text.value)
  return [Math.ceil(metrics.width), Math.ceil(metrics.height)]
}

const maxPx = computed(() => {
  return Math.max(10, canvas.width - getTextWidth()[0])
})
const minPy = computed(() => {
  // 待修正
  return Math.min(30, getTextWidth()[1])
})

watch([originImg, text, pX, pY, fontSize, fontColor], generateWatermark)

onUnmounted(() => {
  if (originImg.value) {
    URL.revokeObjectURL(originImg.value)
  }
})

const applyWatermark = async () => {}
</script>
