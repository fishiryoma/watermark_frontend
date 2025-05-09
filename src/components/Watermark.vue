<template>
  <v-form @submit.prevent="applyWatermark" class="pa-8">
    <v-file-input
      v-model="imageFile"
      label="Upload Image"
      accept=" image/*"
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
        <v-text-field
          v-model.number="pX"
          label="x-position"
          prepend-icon="mdi-arrow-right"
          variant="outlined"
        ></v-text-field>
      </v-col>
      <v-col cols="6">
        <v-text-field
          v-model.number="pY"
          label="y-position"
          prepend-icon="mdi-arrow-down"
          variant="outlined"
        ></v-text-field>
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
        <img :src="previewImg ?? ''" alt="preview" />
      </v-col>
    </v-row>
  </v-form>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { Ref } from 'vue'

// font size setting
interface FontSizeOption {
  title: string
  value: number
}
const fontSizeOptions: FontSizeOption[] = [
  { title: '極小 (10px)', value: 10 },
  { title: '很小 (12px)', value: 12 },
  { title: '小 (16px)', value: 16 },
  { title: '標準 (24px)', value: 24 },
  { title: '中等 (32px)', value: 32 },
  { title: '大 (36px)', value: 36 },
  { title: '較大 (48px)', value: 48 },
  { title: '很大 (64px)', value: 64 },
  { title: '巨大 (72px)', value: 72 },
  { title: '超大 (96px)', value: 96 },
]

// input
const imageFile: Ref<File | null> = ref(null)
// 為了實現PREVIEW REGION
const originImg: Ref<string | null> = ref(null)
const previewImg: Ref<string | null> = ref(null)
const text: Ref<string> = ref('')
const pX: Ref<number> = ref(10)
const pY: Ref<number> = ref(10)
const fontSize: Ref<number> = ref(36)
const fontColor: Ref<string> = ref('white')
const loading: Ref<{ previewLoading: boolean; apiLoading: boolean }> = ref({
  previewLoading: false,
  apiLoading: false,
})

// methods
const handleUpload = (e: any) => {
  console.log(e.target.files[0])
  const file = e.target.files[0]
  if (file) {
    imageFile.value = file
    originImg.value = URL.createObjectURL(file)
  }
}
const generateWatermark = () => {
  if (!originImg.value) return
  if (text.value.length === 0) return

  const img = new Image()
  img.src = originImg.value
  img.onload = () => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    canvas.width = img.width
    canvas.height = img.height
    if (ctx) {
      ctx.drawImage(img, 0, 0)
      ctx.font = `${fontSize.value}px Arial`
      ctx.fillStyle = fontColor.value
      ctx.fillText(text.value, pX.value, pY.value)
    }

    previewImg.value = canvas.toDataURL('image/jpeg')
  }
}

watch([originImg, text, pX, pY, fontSize, fontColor], generateWatermark)

const applyWatermark = async () => {}
</script>
