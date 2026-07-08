<template>
  <div v-if="isActive" class="camera-container">
    <!-- VIDEO PREVIEW -->
    <div v-if="!photo && cameraActive" class="camera-view">
      <video
        ref="videoElement"
        autoplay
        playsinline
        @click="capturePhoto"
      ></video>
      <div class="camera-controls">
        <button class="capture-btn" @click="capturePhoto">
          <span class="material-icons">photo_camera</span>
        </button>
        <p>Clique para tirar a foto</p>
        <button class="close-btn" @click="closeCamera">
          <span class="material-icons">close</span>
        </button>
      </div>
    </div>

    <!-- PHOTO PREVIEW -->
    <div v-else-if="photo" class="photo-preview">
      <img :src="photo" alt="Foto capturada" />
      <div class="preview-controls">
        <button class="confirm-btn" @click="confirmPhoto">
          Usar esta foto
        </button>
        <button class="retake-btn" @click="retakePhoto">
          Tirar novamente
        </button>
        <button class="cancel-btn" @click="closeCamera">
          Cancelar
        </button>
      </div>
    </div>

    <!-- INITIAL SCREEN -->
    <div v-else class="camera-initial">
      <span class="material-icons large-icon">photo_camera</span>
      <h3>Capturar Foto</h3>
      <button class="start-camera-btn" @click="startCamera">
        Iniciar Câmera
      </button>
      <button class="gallery-btn" @click="chooseFromGallery">
        Escolher da Galeria
      </button>
      <button class="cancel-btn" @click="closeCamera">
        Cancelar
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onUnmounted } from 'vue'

interface Props {
  isActive: boolean
}

interface Emits {
  (e: 'photo-captured', photo: string): void
  (e: 'close'): void
  (e: 'gallery'): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()

const videoElement = ref<HTMLVideoElement | null>(null)
const cameraActive = ref(false)
const photo = ref<string | null>(null)
let stream: MediaStream | null = null

const startCamera = async () => {
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment' }
    })
    if (videoElement.value) {
      videoElement.value.srcObject = stream
      cameraActive.value = true
    }
  } catch (error) {
    console.error('Erro ao acessar câmera:', error)
    alert('Permissão de câmera negada')
  }
}

const capturePhoto = () => {
  if (!videoElement.value) return

  const canvas = document.createElement('canvas')
  canvas.width = videoElement.value.videoWidth
  canvas.height = videoElement.value.videoHeight

  const context = canvas.getContext('2d')
  if (context) {
    context.drawImage(videoElement.value, 0, 0)
    photo.value = canvas.toDataURL('image/jpeg', 0.9)
  }
}

const retakePhoto = () => {
  photo.value = null
  if (videoElement.value && stream) {
    videoElement.value.play()
  }
}

const confirmPhoto = () => {
  if (photo.value) {
    emit('photo-captured', photo.value)
    closeCamera()
  }
}

const chooseFromGallery = () => {
  emit('gallery')
  closeCamera()
}

const closeCamera = () => {
  if (stream) {
    stream.getTracks().forEach(track => track.stop())
  }
  cameraActive.value = false
  photo.value = null
  emit('close')
}

onUnmounted(() => {
  closeCamera()
})
</script>

<style scoped>
.camera-container {
  position: fixed;
  inset: 0;
  background: #000;
  z-index: 1001;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* VIDEO PREVIEW */
.camera-view {
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.camera-controls {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.7);
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  color: white;
  z-index: 10;
}

.camera-controls p {
  font-size: 14px;
  margin: 0;
}

.capture-btn {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  border: 4px solid #fff;
  background: rgba(255, 255, 255, 0.2);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  transition: all 0.2s;
}

.capture-btn:active {
  background: rgba(255, 255, 255, 0.4);
  transform: scale(0.95);
}

.close-btn {
  position: absolute;
  top: 12px;
  right: 12px;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

/* PHOTO PREVIEW */
.photo-preview {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
  padding: 20px;
}

.photo-preview img {
  max-width: 90%;
  max-height: 60%;
  object-fit: contain;
  border-radius: 12px;
}

.preview-controls {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
  max-width: 400px;
}

.preview-controls button {
  padding: 14px;
  border-radius: 12px;
  border: none;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
}

.preview-controls button:active {
  opacity: 0.85;
}

.confirm-btn {
  background: #000;
  color: white;
}

.retake-btn {
  background: #333;
  color: white;
  border: 1px solid #555;
}

.cancel-btn {
  background: var(--surface-elevated);
  color: var(--text-color);
  border: 1px solid var(--border-color);
}

/* INITIAL SCREEN */
.camera-initial {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 24px;
  padding: 40px 20px;
  text-align: center;
  color: white;
}

.large-icon {
  font-size: 60px;
  color: rgba(255, 255, 255, 0.7);
}

.camera-initial h3 {
  font-size: 20px;
  margin: 0;
  font-weight: 600;
}

.camera-initial button {
  width: 100%;
  max-width: 300px;
  padding: 14px;
  border-radius: 12px;
  border: none;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
}

.camera-initial button:active {
  opacity: 0.85;
}

.start-camera-btn {
  background: #000;
  color: white;
}

.gallery-btn {
  background: #333;
  color: white;
  border: 1px solid #555;
}

/* RESPONSIVIDADE DESKTOP */
@media (min-width: 768px) {
  .photo-preview {
    padding: 40px;
  }

  .photo-preview img {
    max-width: 70%;
    max-height: 70%;
  }

  .preview-controls {
    max-width: 500px;
  }

  .camera-initial {
    padding: 60px 40px;
  }

  .camera-initial button {
    max-width: 400px;
  }
}
</style>
