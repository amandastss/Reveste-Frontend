<script setup lang="ts">
import { ref, watch, computed } from 'vue'

interface CartItem {
  id: number
  name: string
  color: string
  size: string
  price: number
  quantity: number
  image: string
}

const props = defineProps<{
  item: CartItem | null
  visible: boolean
}>()

const emit = defineEmits<{
  close: []
  update: [data: { size: string; color: string }]
}>()

const selectedSize = ref('')
const selectedColor = ref('')
const activeImageIndex = ref(0)

watch(
  () => props.item,
  (item) => {
    if (item) {
      selectedSize.value = item.size
      selectedColor.value = item.color
      activeImageIndex.value = 0
    }
  },
  { immediate: true }
)

const sizes = ['PP', 'P', 'M', 'G', 'GG', 'XGG']

const colorOptions = [
  {
    name: 'Azul Claro',
    image: 'https://images.unsplash.com/photo-1475178626620-a4d074967452?q=80&w=200&auto=format&fit=crop'
  },
  {
    name: 'Preto',
    image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=200&auto=format&fit=crop'
  },
  {
    name: 'Rosa',
    image: 'https://images.unsplash.com/photo-1581044777550-4cfa60707c03?q=80&w=200&auto=format&fit=crop'
  }
]

const productImages = computed(() => {
  if (!props.item) return []
  return [
    props.item.image,
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=400&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=400&auto=format&fit=crop'
  ]
})

// ── drag-to-dismiss (mobile) ──────────────────────────────────────────────────
const sheetTranslateY = ref(0)
const dragStartY = ref(0)
const isDragging = ref(false)

function onTouchStart(e: TouchEvent) {
  if (!e.touches || !e.touches[0]) return // Validação de segurança para o TypeScript
  dragStartY.value = e.touches[0].clientY
  isDragging.value = true
}

function onTouchMove(e: TouchEvent) {
  if (!isDragging.value || !e.touches || !e.touches[0]) return // Validação de segurança para o TypeScript
  const dy = e.touches[0].clientY - dragStartY.value
  if (dy > 0) {
    sheetTranslateY.value = dy
    e.preventDefault()
  }
}

function onTouchEnd() {
  if (sheetTranslateY.value > 120) {
    emit('close')
  }
  sheetTranslateY.value = 0
  isDragging.value = false
}

function updateItem() {
  emit('update', { size: selectedSize.value, color: selectedColor.value })
  emit('close')
}

function onOverlayClick() {
  emit('close')
}

function onSheetClick(e: MouseEvent) {
  e.stopPropagation()
}
</script>

<template>
  <Teleport to="body">
    <Transition name="overlay-fade">
      <div
        v-if="visible && item"
        class="edit-overlay"
        @click="onOverlayClick"
      >
        <Transition name="sheet-slide" appear>
          <div
            class="edit-sheet"
            :style="{ transform: `translateY(${sheetTranslateY}px)` }"
            :class="{ 'is-dragging': isDragging && sheetTranslateY > 0 }"
            @click="onSheetClick"
            @touchstart="onTouchStart"
            @touchmove="onTouchMove"
            @touchend="onTouchEnd"
          >
            <div class="drag-handle" />

            <button class="close-btn" @click="emit('close')">✕</button>

            <h2 class="modal-title">EDITAR</h2>

            <div class="gallery">
              <div
                class="gallery-track"
                :style="{ transform: `translateX(-${activeImageIndex * 33.333}%)` }"
              >
                <img
                  v-for="(img, i) in productImages"
                  :key="i"
                  :src="img"
                  :alt="`Imagem ${i + 1}`"
                  class="gallery-img"
                  @click="activeImageIndex = i"
                />
              </div>
            </div>

            <div class="gallery-dots">
              <button
                v-for="(_, i) in productImages"
                :key="i"
                class="dot"
                :class="{ active: activeImageIndex === i }"
                @click="activeImageIndex = i"
              />
            </div>

            <div class="section">
              <h3>Tamanho</h3>
              <div class="size-grid">
                <button
                  v-for="s in sizes"
                  :key="s"
                  class="size-btn"
                  :class="{ selected: selectedSize === s }"
                  @click="selectedSize = s"
                >
                  {{ s }}
                </button>
              </div>
            </div>

            <div class="section">
              <h3>Cores</h3>
              <div class="color-grid">
                <div
                  v-for="c in colorOptions"
                  :key="c.name"
                  class="color-option"
                  :class="{ selected: selectedColor === c.name }"
                  @click="selectedColor = c.name"
                >
                  <img :src="c.image" :alt="c.name" />
                  <span>{{ c.name }}</span>
                </div>
              </div>
            </div>

            <button class="update-btn" @click="updateItem">
              ATUALIZAR ITEM
            </button>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped src="../css/edititem.css"></style>
