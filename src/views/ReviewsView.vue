<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import reviewsApi from '@/stores/reviewsApi'

const router = useRouter()
const route = useRoute()
const getPreview = (file: File) => {
  return URL.createObjectURL(file)
}

interface Review {
  id: number
  userName: string
  userAvatar: string
  stars: number
  date: string
  text: string
  images?: string[]
}

// NAV
const isAddingReview = ref(false)
const selectedReview = ref<Review | null>(null)

// LISTA
const reviewsList = ref<Review[]>([])
const produtoId = Number(route.params.id)
console.log('Produto ID:', produtoId)

interface ApiImage {
  image: string
}

interface ApiReview {
  id: number
  userName: string
  userAvatar: string
  stars: number
  text: string
  created_at: string
  images?: ApiImage[]
}

async function fetchReviews() {
  if (!produtoId) {
    console.error('Produto ID inválido')
    return
  }

  try {
    const res = await reviewsApi.getReviews(produtoId)

    reviewsList.value = res.data.map((r: ApiReview) => ({
      id: r.id,
      userName: r.userName,
      userAvatar: r.userAvatar,
      stars: r.stars,
      date: new Date(r.created_at).toLocaleDateString(),
      text: r.text,
      images: r.images?.map((img) => img.image),
    }))
  } catch (err) {
    console.error('Erro ao buscar reviews:', err)
  }
}

onMounted(fetchReviews)

const totalReviews = computed(() => reviewsList.value.length)

// FORM
const newStars = ref(5)
const newText = ref('')

const uploadedImages = ref<File[]>([])

const fileInputRef = ref<HTMLInputElement | null>(null)

const setRating = (rating: number) => {
  newStars.value = rating
}

const openReview = (review: Review) => {
  selectedReview.value = review
}

const triggerPhotoUpload = () => {
  if (uploadedImages.value.length >= 5) {
    alert('Máximo 5 fotos')
    return
  }
  fileInputRef.value?.click()
}

const handleFileSelected = (event: Event) => {
  const target = event.target as HTMLInputElement
  const files = target.files

  if (!files) return

  for (let i = 0; i < files.length; i++) {
    if (uploadedImages.value.length >= 5) break

    const file = files[i]
    if (file) {
      uploadedImages.value.push(file)
    }
  }

  target.value = ''
}

const handleBackAction = () => {
  if (selectedReview.value) {
    selectedReview.value = null
  } else if (isAddingReview.value) {
    isAddingReview.value = false
  } else {
    router.back()
  }
}

//  SUBMIT
async function submitReview() {
  if (!newText.value.trim()) {
    alert('Escreva algo')
    return
  }

  try {
    const formData = new FormData()
    formData.append('stars', String(newStars.value))
    formData.append('text', newText.value)

    uploadedImages.value.forEach((file) => {
      formData.append('images', file)
    })

    await reviewsApi.createReview(produtoId, formData)

    await fetchReviews()

    newText.value = ''
    newStars.value = 5
    uploadedImages.value = []
    isAddingReview.value = false
  } catch (err) {
    console.error(err)
    alert('Erro ao enviar avaliação')
  }
}
</script>

<template>
  <div class="reviews-page-container">
    
    <!-- DETALHE -->
    <template v-if="selectedReview">
      <header class="reviews-header">
        <button class="btn-back" @click="handleBackAction">←</button>
        <h1>DETALHES DA AVALIAÇÃO</h1>
        <div style="width: 40px"></div>
      </header>

      <main class="reviews-content">
        <div class="form-container-desktop single-review-container">
          
          <div class="review-user-row">
            <img :src="selectedReview.userAvatar" class="user-avatar" />
            <div class="user-meta">
              <span class="user-name">{{ selectedReview.userName }}</span>
              <span class="review-date">{{ selectedReview.date }}</span>
            </div>
          </div>

          <div class="stars-display" style="margin-top: 12px">
            <span v-for="n in 5" :key="n">
              {{ n <= selectedReview.stars ? '★' : '☆' }}
            </span>
          </div>

          <p class="review-text">{{ selectedReview.text }}</p>

          <!-- ✅ IMAGENS DO BACKEND -->
          <div
            v-if="selectedReview.images && selectedReview.images.length"
            class="single-review-images"
          >
            <img
              v-for="(img, idx) in selectedReview.images"
              :key="idx"
              :src="img"
              class="single-review-large-img"
            />
          </div>

        </div>
      </main>
    </template>

    <!-- FORM -->
    <template v-else-if="isAddingReview">
      <header class="reviews-header">
        <button class="btn-back" @click="handleBackAction">✕</button>
        <h1>ADICIONE SUA AVALIAÇÃO</h1>
        <button class="btn-action" @click="submitReview">DONE</button>
      </header>

      <main class="reviews-content">
        <div class="form-container-desktop">

          <div class="form-group">
            <label class="form-label">Estrelas</label>
            <div class="interactive-stars">
              <span
                v-for="star in 5"
                :key="star"
                class="star"
                :class="{ active: star <= newStars }"
                @click="setRating(star)"
              >
                ★
              </span>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">
              Your review <span class="required">*</span>
            </label>
            <textarea
              v-model="newText"
              placeholder="O que você achou sobre o produto..."
              class="review-textarea"
            ></textarea>
          </div>

          <div class="form-group">
            <label class="form-label">Attach photo</label>

            <input
              type="file"
              ref="fileInputRef"
              accept="image/*"
              multiple
              class="hidden-file-input"
              @change="handleFileSelected"
            />

            <button class="btn-attach-photo" @click="triggerPhotoUpload">
              ADICIONE SUA FOTO
            </button>

            <span class="attach-subtext">
              You can add up to 5 files
            </span>

            <!-- ✅ PREVIEW LOCAL -->
            <div v-if="uploadedImages.length" class="form-images-preview">
              <img
                v-for="(file, index) in uploadedImages"
                :key="index"
                :src="getPreview(file)"
                class="preview-thumb"
              />
            </div>

          </div>
        </div>
      </main>
    </template>

    <!-- LISTA -->
    <template v-else>
      <header class="reviews-header">
        <button class="btn-back" @click="handleBackAction">←</button>
        <h1>AVALIAÇÃO</h1>
        <button class="btn-action" @click="isAddingReview = true">
          ADD
        </button>
      </header>

      <main class="reviews-content">
        <h2 class="reviews-count-title">
          {{ totalReviews }} reviews
        </h2>

        <div class="reviews-list">
          <div
            v-for="review in reviewsList"
            :key="review.id"
            class="review-item clickable-review"
            @click="openReview(review)"
          >
            
            <div class="review-user-row">
              <img :src="review.userAvatar" class="user-avatar" />
              <div class="user-meta">
                <span class="user-name">{{ review.userName }}</span>
                <span class="review-date">{{ review.date }}</span>
              </div>
            </div>

            <div class="stars-display">
              <span v-for="n in 5" :key="n">
                {{ n <= review.stars ? '★' : '☆' }}
              </span>
            </div>

            <p class="review-text">{{ review.text }}</p>

            <!-- ✅ IMAGENS DA LISTA -->
            <div
              v-if="review.images && review.images.length"
              class="review-images-grid"
            >
              <img
                v-for="(img, idx) in review.images"
                :key="idx"
                :src="img"
                class="attached-review-img"
              />
            </div>

          </div>
        </div>
      </main>
    </template>

  </div>
</template>

    <style scoped>
      @import '../css/reviews.css';
    </style>