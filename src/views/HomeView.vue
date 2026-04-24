
<script setup lang="ts">
const produtos = [
  { id: 1, nome: 'Camiseta preta', preco: 49.9, img: '/shirt1.png' },
  { id: 2, nome: 'Camiseta branca', preco: 39.9, img: '/shirt2.png' },
  { id: 3, nome: 'Moletom oversized', preco: 89.9, img: '/hoodie1.png' },
]

const categorias = [
  'Casual',
  'Streetwear',
  'Formal',
  'Plus',
  'Vintage',
  'Kids',
  'Praia',
  'Esporte',
  'Verão',
  'Inverno',
]
</script>

<template>
  <div class="home">
    <!-- Banner -->
    <div class="banner">
      <img src="/banner.jpg" alt="Promoção" />
    </div>

    <!-- Categorias -->
    <div class="categories">
      <div v-for="cat in categorias" :key="cat" class="item">
        <div class="circle"></div>
        <span>{{ cat }}</span>
      </div>
    </div>

    <!-- Produtos -->
    <div class="products">
      <h3>Para você</h3>

      <div class="grid">
        <div class="card" v-for="p in produtos" :key="p.id">
          <img :src="p.img" alt="" />
          <p class="name">{{ p.nome }}</p>
          <p class="price">R$ {{ p.preco }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.home {
  max-width: 420px;
  margin: 0 auto;
  padding-bottom: 70px; /* espaço pro footer */
  background: #fff;
  font-family: "Montserrat", sans-serif;
}
/* Banner */
.banner {
  padding: 0 12px;
  margin-top: 10px;
}
.banner img {
  width: 100%;
  border-radius: 12px;
}
/* Categorias */
.categories {
  display: grid;
  grid-template-columns: repeat(4, 1fr); /* 4 por linha */
  gap: 12px;
  padding: 12px;
}
.categories span {
  color: black;
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
/* Produtos */
.products {
  padding: 12px;
}
.products h3 {
  font-weight: bold;
  font-size: 16px;
  margin-bottom: 10px;
  color: black;
}
/* grid MOBILE */
.grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}
.grid p {
  color: black;
}
/* card */
.card {
  background: #fafafa;
  border-radius: 12px;
  padding: 8px;
}
.card img {
  width: 100%;
  border-radius: 10px;
}
.name {
  font-size: 13px;
  margin-top: 6px;
}
.price {
  font-size: 13px;
  font-weight: bold;
}
@media (min-width: 768px) {
  .home {
    max-width: 1200px;
    padding: 20px;
    padding-bottom: 20px;
  }

  /* banner maior */
  .banner {
    padding: 0;
  }

  /* categorias mais espaçosas */
  .categories {
    grid-template-columns: repeat(6, 1fr);
    gap: 20px;
    padding: 20px 0;
  }

  .circle {
    width: 60px;
    height: 60px;
  }

  .item {
    font-size: 13px;
  }

  /* produtos */
  .products {
    padding: 0;
  }

  .products h3 {
    font-size: 20px;
    margin-bottom: 20px;
  }

  /* grid de produtos maior */
  .grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;
  }

  .card {
    padding: 12px;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }

  .card:hover {
    transform: translateY(-4px);
    box-shadow: 0 6px 20px rgba(0,0,0,0.08);
  }

  .name {
    font-size: 14px;
  }

  .price {
    font-size: 15px;
  }
}
</style>
