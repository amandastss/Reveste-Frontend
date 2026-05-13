<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from 'axios'

interface Produto {
  id: number
  nome: string
  preco: number
  descricao?: string
  marca?: string
  condicao?: string
  imagem?: {
    url: string
  }
}

const produtos = ref<Produto[]>([])

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

const fetchProdutos = async () => {
  try {
    const response = await axios.get('http://127.0.0.1:8000/api/produtos/')
    produtos.value = response.data.results // 💥 AQUI
  } catch (error) {
    console.error('Erro ao buscar produtos:', error)
  }
}

onMounted(fetchProdutos)
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
          <img :src="p.imagem?.url || ''" />

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
  font-family: 'Montserrat', sans-serif;
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
    transition:
      transform 0.2s ease,
      box-shadow 0.2s ease;
  }

  .card:hover {
    transform: translateY(-4px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
  }

  .name {
    font-size: 14px;
  }

  .price {
    font-size: 15px;
  }
}
</style>
