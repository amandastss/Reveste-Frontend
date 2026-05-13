<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits(['close-menu'])

const openSections = ref<string[]>([])

/* fechar menu */
function closeMenu() {
  emit('close-menu')
}

/* abrir/fechar submenu */
function toggleSection(section: string) {
  if (openSections.value.includes(section)) {
    openSections.value = openSections.value.filter(
      (item: string) => item !== section
    )
  } else {
    openSections.value.push(section)
  }
}

/* trava scroll quando menu abre */
watch(
  () => props.isOpen,
  (value) => {
    document.body.style.overflow = value ? 'hidden' : ''
  }
)
</script>

<template>
  <div>
    <!-- overlay -->
    <transition name="overlay-fade">
      <div
        v-if="props.isOpen"
        class="overlay"
        @click="closeMenu"
      >
        <!-- sidebar -->
        <div
          class="menu-container"
          @click.stop
        >
          <!-- botão fechar -->
          <button
            class="close-button"
            @click="closeMenu"
          >
            ✕
          </button>

          <p class="menu-title">menu</p>

          <div class="menu-content">
            <p class="login">Entrar</p>

            <!-- masculino -->
            <div
              class="menu-item"
              @click="toggleSection('masculino')"
            >
              <span>Masculino</span>
              <span>
                {{
                  openSections.includes('masculino')
                    ? '−'
                    : '+'
                }}
              </span>
            </div>

            <transition name="fade">
              <div
                v-if="openSections.includes('masculino')"
                class="submenu"
              >
                <p>Camisetas</p>
                <p>Calças</p>
              </div>
            </transition>

            <!-- feminino -->
            <div
              class="menu-item"
              @click="toggleSection('feminino')"
            >
              <span>Feminino</span>
              <span>
                {{
                  openSections.includes('feminino')
                    ? '−'
                    : '+'
                }}
              </span>
            </div>

            <transition name="fade">
              <div
                v-if="openSections.includes('feminino')"
                class="submenu"
              >
                <p>Vestidos</p>
                <p>Saias</p>
              </div>
            </transition>

            <!-- infantil -->
            <div
              class="menu-item"
              @click="toggleSection('infantil')"
            >
              <span>Infantil</span>
              <span>
                {{
                  openSections.includes('infantil')
                    ? '−'
                    : '+'
                }}
              </span>
            </div>

            <transition name="fade">
              <div
                v-if="openSections.includes('infantil')"
                class="submenu"
              >
                <p>Meninos</p>
                <p>Meninas</p>
              </div>
            </transition>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped>
/* =========================
   OVERLAY
========================= */
.overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;

  background: rgba(0, 0, 0, 0.35);

  display: flex;
  justify-content: flex-start;
  align-items: stretch;
}

/* animação overlay */
.overlay-fade-enter-active,
.overlay-fade-leave-active {
  transition: opacity 0.25s ease;
}

.overlay-fade-enter-from,
.overlay-fade-leave-to {
  opacity: 0;
}

/* =========================
   SIDEBAR
========================= */
.menu-container {
  width: 82%;
  max-width: 320px;
  height: 100vh;

  background: #000;
  color: white;

  padding: 20px;
  box-sizing: border-box;

  font-family: "Montserrat", sans-serif;

  overflow-y: auto;
  box-shadow: 4px 0 20px rgba(0, 0, 0, 0.25);

  animation: slideIn 0.25s ease;
}

/* animação lateral */
@keyframes slideIn {
  from {
    transform: translateX(-100%);
  }

  to {
    transform: translateX(0);
  }
}

/* =========================
   BOTÃO FECHAR
========================= */
.close-button {
  background: transparent;
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
  margin-bottom: 20px;
}

/* =========================
   TEXTOS
========================= */
.menu-title {
  font-size: 13px;
  color: #888;
  margin-bottom: 20px;
  text-transform: uppercase;
}

.login {
  margin-bottom: 28px;
  font-size: 15px;
  cursor: pointer;
}

/* =========================
   ITENS
========================= */
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

/* =========================
   SUBMENU
========================= */
.submenu {
  padding: 10px 0 10px 12px;
  color: #bdbdbd;
  font-size: 14px;
}

.submenu p {
  margin: 10px 0;
  cursor: pointer;
}

/* =========================
   ANIMAÇÃO SUBMENU
========================= */
.fade-enter-active,
.fade-leave-active {
  transition: all 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

/* =========================
   DESKTOP
========================= */
@media (min-width: 768px) {
  .menu-container {
    width: 320px;
  }
}
</style>