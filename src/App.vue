<script setup lang="ts">
import HeaderMobile from './components/HeaderMobileComponent.vue';
import HeaderDesktop from './components/HeaderDesktopComponent.vue';
import FooterMobile from './components/FooterMobileComponent.vue';
</script>

<template>
  <HeaderMobile />


  <HeaderDesktop />


  <router-view />


  <FooterMobile />
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
</style>