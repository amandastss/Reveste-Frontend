<script setup lang="ts">
import { ref, watch, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { API_BASE, getStoredToken } from '@/api/config'

const props = defineProps<{ isOpen: boolean }>()
const emit = defineEmits(['close-menu'])
const router = useRouter()
const isLoggedIn = computed(() => !!getStoredToken())
const categorias = ref<Array<{ id: number; nome?: string; name?: string; title?: string }>>([])

function closeMenu() {
  emit('close-menu')
}

async function fetchCategorias() {
  try {
    const res = await axios.get(`${API_BASE}/api/categorias/`)
    categorias.value = Array.isArray(res.data) ? res.data : res.data.results || []
  } catch (error) {
    console.error('Erro ao buscar categorias do menu mobile:', error)
    categorias.value = []
  }
}

function goToLogin() {
  closeMenu()
  router.push('/auth/email')
}

function goToCategory(categoryId: number) {
  closeMenu()
  router.push({ name: 'categoria', params: { id: String(categoryId) } })
}

watch(
  () => props.isOpen,
  (value) => {
    document.body.style.overflow = value ? 'hidden' : ''
  },
)

onMounted(() => {
  fetchCategorias()
})
</script>

<template>
  <div>
    <transition name="overlay-fade">
      <div v-if="props.isOpen" class="overlay" @click="closeMenu">
        <div class="menu-container" @click.stop>
          <button class="close-button" @click="closeMenu">✕</button>
          <p class="menu-title">menu</p>

          <div class="menu-content">
            <p v-if="!isLoggedIn" class="login" @click="goToLogin">Entrar/Cadastrar</p>

            <div v-if="categorias.length" class="category-list">
              <button
                v-for="item in categorias"
                :key="item.id"
                class="category-item"
                @click="goToCategory(item.id)"
              >
                {{ item.nome || item.name || item.title }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(0, 0, 0, 0.35);
  display: flex;
  justify-content: flex-start;
  align-items: stretch;
}

.overlay-fade-enter-active,
.overlay-fade-leave-active {
  transition: opacity 0.25s ease;
}

.overlay-fade-enter-from,
.overlay-fade-leave-to {
  opacity: 0;
}

.menu-container {
  width: 82%;
  max-width: 320px;
  height: 100vh;
  background: black;
  color: white;
  padding: 20px;
  box-sizing: border-box;
  font-family: 'Montserrat', sans-serif;
  overflow-y: auto;
  box-shadow: 4px 0 20px rgba(0, 0, 0, 0.15);
  animation: slideIn 0.25s ease;
}

@keyframes slideIn {
  from {
    transform: translateX(-100%);
  }
  to {
    transform: translateX(0);
  }
}

.close-button {
  background: transparent;
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
  margin-bottom: 20px;
}

.menu-title {
  font-size: 13px;
  color: var(--text-muted);
  margin-bottom: 20px;
  text-transform: uppercase;
}

.login {
  margin-bottom: 28px;
  font-size: 15px;
  cursor: pointer;
}

.category-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.category-item {
  width: 100%;
  background: transparent;
  border: none;
  color: white;
  border-radius: 0;
  padding: 12px 0;
  text-align: left;
  font-size: 14px;
  cursor: pointer;
  transition: 0.2s;
}

.category-item:hover {
  opacity: 0.75;
}

.fade-enter-active,
.fade-leave-active {
  transition: all 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

@media (min-width: 768px) {
  .menu-container {
    width: 320px;
  }
}
</style>
