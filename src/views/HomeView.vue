<script setup lang="ts">

import Header from '@/components/HeaderComponent.vue'
import Banner from '@/components/BannerComponent.vue'
import Categories from '@/components/CategoriesComponent.vue'
import ProductList from '@/components/ProductList.vue'
import BottomNav from '@/components/BottomNav.vue'

</script>

<template>
  <div class="home">
    <Header />
    <Banner />
    <Categories />
    <ProductList />
    <BottomNav />
  </div>
</template>