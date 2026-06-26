<script setup lang="ts">
import { ref } from 'vue'

import HeaderMobile from './components/HeaderMobileComponent.vue'
import HeaderDesktop from './components/HeaderDesktopComponent.vue'
import FooterMobile from './components/FooterMobileComponent.vue'
import MenuComponent from './components/MenuComponent.vue'

/* controla abrir e fechar o menu lateral */
const isMenuOpen = ref(false)

function openMenu() {
  isMenuOpen.value = true
}

function closeMenu() {
  isMenuOpen.value = false
}
</script>

<template>
  <div class="app-container">
    <HeaderMobile @open-menu="openMenu" />

    <HeaderDesktop />

    <MenuComponent
      :isOpen="isMenuOpen"
      @close-menu="closeMenu"
    />

    <main class="content">
      <router-view />
    </main>

    <FooterMobile />
  </div>
</template>

<style scoped>
/* esconder header mobile no desktop */
@media (min-width: 768px) {
  :deep(.header-mobile) {
    display: none;
  }
}

/* esconder header desktop no mobile */
@media (max-width: 767px) {
  :deep(.header-desktop) {
    display: none;
  }
}

/* esconder footer mobile no desktop */
@media (min-width: 768px) {
  :deep(.app-footer) {
    display: none;
  }
}

/* estrutura principal */
.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: var(--app-bg);
  color: var(--text-color);
}

/* conteúdo principal */
.content {
  flex: 1;
  background: var(--app-bg);
}

/* centralização */
.content > * {
  width: 100%;
}
</style>
