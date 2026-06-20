<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from "vue"
import { useRouter } from "vue-router"
import axios from 'axios'

const router = useRouter()

const videoRef = ref<HTMLVideoElement | null>(null)
const stream = ref<MediaStream | null>(null)
const imagem = ref<string | null>(null)
const resultados = ref<any[]>([])
const loading = ref(false)

async function startCamera() {
  try {
    const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
    stream.value = s
    if (videoRef.value) {
      videoRef.value.srcObject = s
      await videoRef.value.play()
    }
  } catch (err) {
    console.error('Erro ao acessar câmera', err)
    alert('Não foi possível acessar a câmera. Verifique permissões.')
    router.back()
  }
}

function stopCamera() {
  if (stream.value) {
    stream.value.getTracks().forEach(t => t.stop())
    stream.value = null
  }
  if (videoRef.value) {
    videoRef.value.pause()
    videoRef.value.srcObject = null
  }
}

const cameraPermitida = ref(false)

onMounted(async () => {
  try {
    await navigator.mediaDevices.getUserMedia({ video: true })
    cameraPermitida.value = true
    startCamera()
  } catch (err) {
    console.error(err)
    alert('Permissão da câmera negada')
    router.back()
  }
})
onUnmounted(() => {
  stopCamera()
})

function capturePhoto() {
  if (!videoRef.value) return

  const canvas = document.createElement('canvas')
  canvas.width = videoRef.value.videoWidth || 1280
  canvas.height = videoRef.value.videoHeight || 720
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  ctx.drawImage(videoRef.value, 0, 0, canvas.width, canvas.height)
  imagem.value = canvas.toDataURL('image/jpeg', 0.9)
  if (videoRef.value) {
    videoRef.value.pause()
  }
}

async function retakePhoto() {
  imagem.value = null
  await nextTick()
  if (videoRef.value && stream.value) {
    await videoRef.value.play()
  }
}

async function enviarFoto() {
  if (!imagem.value) return

  sessionStorage.setItem('camera-image', imagem.value)

  router.push('/pesquisa-camera')
}

function voltar() {
  stopCamera()
  router.back()
}
</script>

<template>
  <div class="camera-page">

    <!-- HEADER -->
    <div class="top-bar">
      <span class="material-symbols-outlined" @click="voltar">arrow_back</span>

      <p>TIRE UMA FOTO</p>
    </div>

    <!-- VIDEO / CAMERA / PREVIEW -->
    <div class="camera-container">
      <div class="camera-frame">
        <video
          ref="videoRef"
          v-show="!imagem"
          autoplay
          playsinline
          muted
          class="camera-video"
        ></video>
        <img v-show="imagem" :src="imagem" alt="Preview" class="camera-photo" />

        <div v-if="!imagem" class="camera-controls">
          <button class="capture-btn" @click="capturePhoto">Tirar foto</button>
        </div>

        <div v-else class="preview-controls">
          <div class="row-actions">
            <button class="confirm-btn" @click="enviarFoto" :disabled="loading">Enviar foto</button>
            <button class="retake-btn" @click="retakePhoto">Tirar novamente</button>
          </div>
          <button class="cancel-btn" @click="voltar">Cancelar</button>
        </div>
      </div>
    </div>

    <!-- RESULTADOS -->
    <div class="grid" v-if="resultados.length">
      <div class="item" v-for="item in resultados" :key="item.id">
        <img :src="item.imagem" />
        <p class="nome">{{ item.nome }}</p>
        <p class="preco">R$ {{ item.preco }}</p>
      </div>
    </div>

  </div>
</template>

<style scoped src="../css/camera-search.css"></style>
