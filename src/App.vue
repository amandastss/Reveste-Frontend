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
    <!-- header mobile -->
    <HeaderMobile @open-menu="openMenu" />

    <!-- header desktop -->
    <HeaderDesktop />

    <!-- menu lateral -->
    <MenuComponent
      :isOpen="isMenuOpen"
      @close-menu="closeMenu"
    />

    <!-- conteúdo principal -->
    <main class="content">
      <router-view />
    </main>

    <!-- footer mobile -->
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
}

/* conteúdo principal */
.content {
  flex: 1;
}

/* centralização */
.content > * {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
}
</style>