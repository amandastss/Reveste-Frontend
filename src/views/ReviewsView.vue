<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

interface Review {
  id: number;
  userName: string;
  userAvatar: string;
  stars: number;
  date: string;
  text: string;
  images?: string[];
}

// Estados de Navegação
const isAddingReview = ref<boolean>(false);
const selectedReview = ref<Review | null>(null); // Guarda a avaliação que o usuário clicou

const reviewsList = ref<Review[]>([
  {
    id: 1,
    userName: 'Miracle Baptista',
    userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80',
    stars: 4,
    date: 'Nov 10th, 2021',
    text: 'Gostei.',
    images: [
      'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=150&q=80',
      'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=150&q=80',
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=150&q=80'
    ]
  },
  {
    id: 2,
    userName: 'Talan Aminoff',
    userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80',
    stars: 4,
    date: 'Nov 10th, 2021',
    text: 'Peguem tamanho maior pq encolheu na máquina!!!!!',
    images: ['https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=150&q=80']
  }
]);

const totalReviews = computed(() => reviewsList.value.length);

// --- ESTADOS DO FORMULÁRIO ---
const newStars = ref<number>(5);
const newText = ref<string>('');
const uploadedImages = ref<string[]>([]);
const fileInputRef = ref<HTMLInputElement | null>(null); // Referência para o input oculto

const setRating = (rating: number) => {
  newStars.value = rating;
};

// Abre uma avaliação existente para ver detalhes
const openReview = (review: Review) => {
  selectedReview.value = review;
};

// Aciona o clique no input de arquivo escondido
const triggerPhotoUpload = () => {
  if (uploadedImages.value.length >= 5) {
    alert('Você pode adicionar no máximo 5 fotos.');
    return;
  }
  fileInputRef.value?.click();
};

// Lê a foto escolhida do celular/computador e cria uma URL temporária para mostrar na tela
const handleFileSelected = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const files = target.files;

  if (!files) return;

  for (let i = 0; i < files.length; i++) {
    if (uploadedImages.value.length >= 5) break; 
    const file = files[i];

    // CORREÇÃO: Verifica se o arquivo realmente existe para acalmar o TypeScript
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      uploadedImages.value.push(imageUrl);
    }
  }

  target.value = '';
};

const handleBackAction = () => {
  if (selectedReview.value) {
    selectedReview.value = null;
  } else if (isAddingReview.value) {
    isAddingReview.value = false;
  } else {
    router.back();
  }
};

const submitReview = () => {
  if (!newText.value.trim()) {
    alert('Por favor, escreva seu comentário.');
    return;
  }

  reviewsList.value.unshift({
    id: Date.now(),
    userName: 'Você',
    userAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80',
    stars: newStars.value,
    date: 'Agora',
    text: newText.value,
    images: uploadedImages.value.length > 0 ? [...uploadedImages.value] : undefined
  });

  newText.value = '';
  newStars.value = 5;
  uploadedImages.value = [];
  isAddingReview.value = false;
};
</script>

<template>
  <div class="reviews-page-container">

    <template v-if="selectedReview">
      <header class="reviews-header">
        <button class="btn-back" @click="handleBackAction">←</button>
        <h1>DETALHES DA AVALIAÇÃO</h1>
        <div style="width: 40px;"></div> </header>

      <main class="reviews-content">
        <div class="form-container-desktop single-review-container">
          <div class="review-user-row">
            <img :src="selectedReview.userAvatar" class="user-avatar" />
            <div class="user-meta">
              <span class="user-name">{{ selectedReview.userName }}</span>
              <span class="review-date">{{ selectedReview.date }}</span>
            </div>
          </div>

          <div class="stars-display" style="margin-top: 12px;">
            <span v-for="n in 5" :key="n">{{ n <= selectedReview.stars ? '★' : '☆' }}</span>
          </div>

          <p class="review-text">{{ selectedReview.text }}</p>

          <div v-if="selectedReview.images?.length" class="single-review-images">
            <img v-for="(img, idx) in selectedReview.images" :key="idx" :src="img" class="single-review-large-img" />
          </div>
        </div>
      </main>
    </template>

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
              <span v-for="star in 5" :key="star" class="star" :class="{ active: star <= newStars }" @click="setRating(star)">★</span>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Your review <span class="required">*</span></label>
            <textarea v-model="newText" placeholder="O que você achou sobre o produto..." class="review-textarea"></textarea>
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
            <span class="attach-subtext">You can add up to 5 files</span>

            <div v-if="uploadedImages.length > 0" class="form-images-preview">
              <img v-for="(preview, index) in uploadedImages" :key="index" :src="preview" class="preview-thumb" />
            </div>
          </div>

        </div>
      </main>
    </template>

    <template v-else>
      <header class="reviews-header">
        <button class="btn-back" @click="handleBackAction">←</button>
        <h1>AVALIAÇÃO</h1>
        <button class="btn-action" @click="isAddingReview = true">ADD</button>
      </header>

      <main class="reviews-content">
        <h2 class="reviews-count-title">{{ totalReviews }} reviews</h2>

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
              <span v-for="n in 5" :key="n">{{ n <= review.stars ? '★' : '☆' }}</span>
            </div>

            <p class="review-text">{{ review.text }}</p>

            <div v-if="review.images && review.images.length > 0" class="review-images-grid">
              <img v-for="(img, idx) in review.images" :key="idx" :src="img" class="attached-review-img" />
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
