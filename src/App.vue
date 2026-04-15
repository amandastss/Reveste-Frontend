<script setup lang="ts">
import HeaderMobile from './components/HeaderMobileComponent.vue';
import HeaderDesktop from './components/HeaderDesktopComponent.vue';
import FooterMobile from './components/FooterMobileComponent.vue';
</script>

<template>
  <div class="app-container">
    <HeaderMobile />
    <HeaderDesktop />

    <main class="content">
      <router-view />
    </main>

    <FooterMobile />
  </div>
</template>

<style scoped>

@media (min-width: 768px) {
  :deep(.header-mobile) {
    display: none;
  }
}

@media (max-width: 767px) {
  :deep(.header-desktop) {
    display: none;
  }
}

@media (min-width: 768px) {
  :deep(.app-footer) {
    display: none;
  }
}

.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.content {
  flex: 1;
}

.content > * {
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}
</style>