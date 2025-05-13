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
          :disabled="text.length === 0"
        ></v-slider>
      </v-col>
      <v-col cols="6">
        <v-slider
          v-model="pY"
          label="y-position"
          prepend-icon="mdi-arrow-up-down-bold"
          :min="minPy"
          :max="maxPy"
          :disabled="text.length === 0"
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
    <v-row align="center" justify="center" class="py-6">
      <v-btn size="x-large" rounded="xl" type="submit">Add Watermark</v-btn>
      <v-btn v-if="downloadImg" size="x-large" rounded="xl" @click="download" class="ml-4"
        >Download</v-btn
      >
    </v-row>
    <v-row class="pl-10">
      <v-col cols="auto">
        <v-color-picker v-model="fontColor" mode="hex"></v-color-picker>
      </v-col>
      <v-col>
        <v-skeleton-loader v-if="loading" type="paragraph"></v-skeleton-loader>
        <template v-else>
          <img v-if="previewImg && !loading" :src="previewImg ?? ''" alt="preview" />
        </template>
      </v-col>
    </v-row>
  </v-form>
</template>

<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from 'vue'
import type { Ref } from 'vue'
// import { debounce, reject } from 'lodash'
import { doUpload } from '@/api/axios'

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
const pY: Ref<number> = ref(0)
const fontSize: Ref<number> = ref(36)
const fontColor: Ref<string> = ref('#FFF')
const loading: Ref<boolean> = ref(false)

const downloadImg: Ref<{ imgUrl: string; fileName: string } | null> = ref(null)

// methods
const handleUpload = async (e: any) => {
  loading.value = true
  const file = e.target.files[0]
  if (file) {
    imageFile.value = file
    // 壓縮圖片
    const compressedImg = await compressedImage(file, 1920)
    originImg.value = compressedImg
    // URL.createObjectURL無法對圖片做壓縮或縮放
    // originImg.value = URL.createObjectURL(file)
  }
  loading.value = false
}

const compressedImage = async (file: File, maxWidth: number): Promise<string> => {
  return new Promise((res, rej) => {
    const img = new Image()
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = (e: any) => {
      img.src = e.target?.result as string
    }
    reader.onerror = rej
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      let width = img.width
      let height = img.height
      if (width > maxWidth) {
        height = (maxWidth / width) * height
        width = maxWidth
      }
      canvas.width = width
      canvas.height = height
      ctx?.drawImage(img, 0, 0, width, height)
      res(canvas.toDataURL('image/jpeg', 0.6))
    }
    img.onerror = rej
  })
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
        const [width, height] = getTextSize()
        ctx.fillText(
          text.value,
          pX.value + width > canvas.width ? canvas.width - width : pX.value,
          pY.value < height ? height : pY.value,
        )
      }
    }
    previewImg.value = canvas.toDataURL('image/jpeg')
  }
  img.onerror = () => {
    console.error('Fail to load img')
    previewImg.value = null
  }
}

// 每0.1秒更新一次
// const generateWatermarkDebounced = debounce(generateWatermark, 100)

const getTextSize = (): number[] => {
  if (!text.value || !ctx) return [0, 0]
  ctx.font = `${fontSize.value}px Arial`
  const metrics = ctx.measureText(text.value)
  const height = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent
  return [Math.ceil(metrics.width), Math.ceil(height)]
}

const maxPx = computed(() => {
  return Math.max(10, canvas.width - getTextSize()[0])
})
const minPy = computed(() => {
  return Math.min(0, getTextSize()[1])
})
const maxPy = computed(() => {
  return canvas.height - getTextSize()[1] / 2
})

watch([originImg, text, pX, pY, fontSize, fontColor], generateWatermark)

onUnmounted(() => {
  if (originImg.value) {
    URL.revokeObjectURL(originImg.value)
  }
})

const applyWatermark = async () => {
  loading.value = true
  try {
    const res = await doUpload('/watermark', imageFile.value as File, {
      text: text.value,
      x: pX.value.toFixed(0),
      y: pY.value.toFixed(0),
      font: fontSize.value,
      color: fontColor.value,
    })
    downloadImg.value = res
  } catch (err) {
    console.log(err)
  } finally {
    loading.value = false
  }
}

const download = () => {
  if (!downloadImg.value) return

  const { fileName, imgUrl } = downloadImg.value
  const link = document.createElement('a')
  link.download = fileName
  link.href = imgUrl
  document.body.appendChild(link)
  link.click()
  // 清理檔案
  document.body.removeChild(link)
  URL.revokeObjectURL(imgUrl)
}
</script>
