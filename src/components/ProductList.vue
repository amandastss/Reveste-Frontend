<template>
  <div class="products">
    <h3>Para você</h3>

    <div class="grid">
      <div class="card" v-for="p in produtos" :key="p.id">
        <img :src="p.img" />
        <p>{{ p.nome }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const produtos = [
  { id: 1, nome: "Camiseta preta", img: "/shirt1.png" },
  { id: 2, nome: "Camiseta branca", img: "/shirt2.png" },
  { id: 3, nome: "Moletom preto", img: "/hoodie1.png" }
]
</script>
<style scoped>
.products {
  padding: 12px;
}
.products img {
    height: 100%;
    width: 100%;
}

h3 {
  font-size: 16px;
  margin-bottom: 10px;
}

.grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr); /* MOBILE = 2 colunas */
  gap: 10px;
}

.card img {
  width: 100%;
  border-radius: 10px;
}

.card p {
  font-size: 12px;
}
</style>