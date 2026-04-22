<script setup lang="ts">
import { ref } from 'vue';

const isOpen = ref(true); // controla abrir/fechar
const openSections = ref<string[]>([]);

function toggleSection(section: string) {
  if (openSections.value.includes(section)) {
    openSections.value = openSections.value.filter(s => s !== section);
  } else {
    openSections.value.push(section);
  }
}

function closeMenu() {
  isOpen.value = false;
}
</script>

<template>
  <div v-if="isOpen" class="overlay" @click="closeMenu">

    <div class="menu-container" @click.stop>

      <!-- BOTÃO FECHAR -->
      <button class="close-button" @click="closeMenu">
        ✕
      </button>

      <p class="menu-title">menu</p>

      <div class="menu-content">

        <p class="login">Entrar</p>

        <!-- MASCULINO -->
        <div class="menu-item" @click="toggleSection('masculino')">
          <span>Masculino</span>
          <span>{{ openSections.includes('masculino') ? '−' : '+' }}</span>
        </div>

        <transition name="fade">
          <div v-if="openSections.includes('masculino')" class="submenu">
            <p>Camisetas</p>
            <p>Calças</p>
          </div>
        </transition>

        <!-- FEMININO -->
        <div class="menu-item" @click="toggleSection('feminino')">
          <span>Feminino</span>
          <span>{{ openSections.includes('feminino') ? '−' : '+' }}</span>
        </div>

        <transition name="fade">
          <div v-if="openSections.includes('feminino')" class="submenu">
            <p>Vestidos</p>
            <p>Saias</p>
          </div>
        </transition>

        <!-- INFANTIL -->
        <div class="menu-item" @click="toggleSection('infantil')">
          <span>Infantil</span>
          <span>{{ openSections.includes('infantil') ? '−' : '+' }}</span>
        </div>

        <transition name="fade">
          <div v-if="openSections.includes('infantil')" class="submenu">
            <p>Meninos</p>
            <p>Meninas</p>
          </div>
        </transition>

      </div>

    </div>

  </div>
</template>

<style scoped>
/* =========================
   OVERLAY (FUNDO ESCURO)
========================= */
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 999;

  display: flex;
}

/* animação do overlay */
.overlay-enter-active,
.overlay-leave-active {
  transition: opacity 0.25s ease;
}

.overlay-enter-from,
.overlay-leave-to {
  opacity: 0;
}

/* =========================
   MENU (SIDEBAR)
========================= */
.menu-container {
  background: black;
  color: white;

  width: 80%;
  max-width: 320px;
  height: 100%;
  font-family: "Montserrat", sans-serif;
  padding: 20px;

  display: flex;
  flex-direction: column;

  /* IMPORTANTE: animação suave */
  transform: translateX(0);
}

/* animação de ENTRADA/SAÍDA */
.menu-slide-enter-active,
.menu-slide-leave-active {
  transition: transform 0.25s ease;
}

.menu-slide-enter-from,
.menu-slide-leave-to {
  transform: translateX(-100%);
}

/* =========================
   BOTÃO FECHAR
========================= */
.close-button {
  background: transparent;
  border: none;
  color: white;
  font-size: 22px;
  margin-bottom: 20px;
  cursor: pointer;
}

/* =========================
   TEXTOS
========================= */
.menu-title {
  color: gray;
  font-size: 14px;
  margin-bottom: 20px;
}

.login {
  margin-bottom: 30px;
}

/* =========================
   ITENS
========================= */
.menu-item {
  display: flex;
  justify-content: space-between;
  align-items: center;

  padding: 16px 0;
  cursor: pointer;

  border-bottom: 1px solid #222;
  transition: opacity 0.2s ease;
}

.menu-item:hover {
  opacity: 0.7;
}

/* =========================
   SUBMENU
========================= */
.submenu {
  padding-left: 10px;
  color: #bbb;
  font-size: 14px;
}

/* itens do submenu */
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
   DESKTOP (RESPONSIVO)
========================= */
@media (min-width: 768px) {
  .menu-container {
    width: 300px;
  }
}
</style>