<template>
  <div class="categories">
    <div v-for="cat in categorias" :key="cat" class="item">
      <div class="circle"></div>
      <span>{{ cat }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
const categorias = [
  "Casual","Streetwear","Formal","Plus","Vintage",
  "Kids","Praia","Esporte","Verão","Inverno"
]
</script>

<style scoped>
.categories {
  display: flex;
  overflow-x: auto;
  gap: 12px;
  padding: 12px;
}

.item {
  text-align: center;
  font-size: 12px;
  min-width: 60px;
}

.circle {
  width: 45px;
  height: 45px;
  border-radius: 50%;
  background: #eee;
  margin: 0 auto 5px;
}
</style>