<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from 'axios'

interface Produto {
  id: number
  name: string /* Alterado de 'nome' para 'name' conforme o padrão do seu carrinho se necessário, mas mantido a lógica */
  nome: string
  preco: number
  imagem_url?: string | null
}

interface Categoria {
  id: number
  nome: string
  imagem_url: string | null
}

const produtos = ref<Produto[]>([])
const categorias = ref<Categoria[]>([])

// PRODUTOS
const fetchProdutos = async () => {
  try {
    const res = await axios.get('http://127.0.0.1:8000/api/produtos/')
    produtos.value = res.data.results
  } catch (err) {
    console.error(err)
  }
}

// CATEGORIAS
const fetchCategorias = async () => {
  try {
    const res = await axios.get('http://127.0.0.1:8000/api/categorias/')
    categorias.value = res.data.results
  } catch (err) {
    console.error(err)
  }
}

onMounted(() => {
  fetchProdutos()
  fetchCategorias()
})
</script>

<template>
  <div class="home">
    <div class="banner">
      <img src="/banner.jpg" alt="Promoção" />
    </div>

    <div class="categories">
      <div v-for="cat in categorias" :key="cat.id" class="item">
        <img class="circle" :src="'http://127.0.0.1:8000' + cat.imagem_url" />
        <span>{{ cat.nome }}</span>
      </div>
    </div>

    <div class="products">
      <h3>Para você</h3>

      <div class="grid">
        <div class="card" v-for="p in produtos" :key="p.id">
         <img :src="p.imagem_url || '/default.png'" />
          <p class="name">{{ p.nome }}</p>
          <p class="price">R$ {{ p.preco }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.home {
  width: 100%;
  max-width: none; /* Remove a limitação de 420px mobile */
  margin: 0;
  padding: 12px;
  padding-bottom: 80px;
  background: white; /* Corrigido de #f6f6f7 para white para unificar as cores de fundo */
  font-family: 'Montserrat', sans-serif;
}

/* BANNER */
.banner {
  padding: 0;
  margin-bottom: 16px;
}

.banner img {
  width: 100%;
  border-radius: 16px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
}

/* CATEGORIAS */
.categories {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
  padding: 12px 0;
}

.item {
  text-align: center;
  font-size: 12px;
  cursor: pointer;
  transition: transform 0.15s ease;
}

.item:active {
  transform: scale(0.95);
}

.circle {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  margin: 0 auto 6px;
  object-fit: cover;
}

.categories span {
  color: #222;
  font-weight: 500;
}

/* PRODUTOS */
.products {
  padding: 12px 0;
}

.products h3 {
  font-size: 18px;
  margin-bottom: 14px;
  color: #111;
}

/* GRID */
.grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;
}

/* CARD */
.card {
  background: white;
  border-radius: 16px;
  padding: 10px;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.card:active {
  transform: scale(0.97);
}

@media (hover: hover) {
  .card:hover {
    transform: translateY(-4px);
    box-shadow: 0 10px 24px rgba(0, 0, 0, 0.08);
  }
}

.card img {
  width: 100%;
  border-radius: 12px;
  aspect-ratio: 1/1;
  object-fit: cover;
}

/* TEXTO */
.name {
  font-size: 13px;
  margin-top: 8px;
  color: #222;
}

.price {
  font-size: 14px;
  font-weight: 600;
  margin-top: 2px;
  color: black;
}

/* DESKTOP */
@media (min-width: 768px) {
  .home {
    padding: 20px;
    padding-bottom: 40px;
  }

  .banner {
    margin-bottom: 24px;
  }

  .categories {
    grid-template-columns: repeat(6, 1fr);
    gap: 20px;
    padding: 20px 0;
  }

  .circle {
    width: 65px;
    height: 65px;
  }

  .item {
    font-size: 13px;
  }

  .products h3 {
    font-size: 22px;
    margin-bottom: 20px;
  }

  .grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;
  }
}
</style>
