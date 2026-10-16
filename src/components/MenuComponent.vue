<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps<{ isOpen: boolean }>()
const emit = defineEmits(['close-menu'])
const router = useRouter()
const openSections = ref<string[]>([])
const isLoggedIn = computed(() => !!localStorage.getItem('token'))

function closeMenu() {
  emit('close-menu')
}

function toggleSection(section: string) {
  openSections.value = openSections.value.includes(section)
    ? openSections.value.filter((item) => item !== section)
    : [...openSections.value, section]
}

function goToLogin() {
  closeMenu()
  router.push('/auth/email')
}

watch(
  () => props.isOpen,
  (value) => {
    document.body.style.overflow = value ? 'hidden' : ''
  },
)
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

            <div class="menu-item" @click="toggleSection('roupas')">
              <span>Roupas</span>
              <span>{{ openSections.includes('roupas') ? '−' : '+' }}</span>
            </div>
            <transition name="fade">
              <div v-if="openSections.includes('roupas')" class="submenu">
                <p>Camisetas</p>
                <p>Calças</p>
                <p>Vestidos</p>
                <p>Saias</p>
                <p>Shorts</p>
                <p>Jaquetas</p>
                <p>Moletons</p>
              </div>
            </transition>

            <div class="menu-item" @click="toggleSection('calcados')">
              <span>Calçados</span>
              <span>{{ openSections.includes('calcados') ? '−' : '+' }}</span>
            </div>
            <transition name="fade">
              <div v-if="openSections.includes('calcados')" class="submenu">
                <p>Tênis</p>
                <p>Botas</p>
                <p>Sandálias</p>
                <p>Sapatos</p>
              </div>
            </transition>

            <div class="menu-item" @click="toggleSection('acessorios')">
              <span>Acessórios</span>
              <span>{{ openSections.includes('acessorios') ? '−' : '+' }}</span>
            </div>
            <transition name="fade">
              <div v-if="openSections.includes('acessorios')" class="submenu">
                <p>Bolsas</p>
                <p>Bonés</p>
                <p>Óculos</p>
                <p>Bijuterias</p>
              </div>
            </transition>
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

.menu-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid #1f1f1f;
  cursor: pointer;
  transition: 0.2s;
}

.menu-item:hover {
  opacity: 0.75;
}

.submenu {
  padding: 10px 0 10px 12px;
  color: #bdbdbd;
  font-size: 14px;
}

.submenu p {
  margin: 10px 0;
  cursor: pointer;
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
