<script setup lang="ts">
import { ref } from 'vue';
import SizeBottomSheetComponent from '../components/SizeBottomSheetComponent.vue';

// Controle do Modal de Tamanhos
const isBottomSheetOpen = ref<boolean>(false);
const chosenSize = ref<string>('XXL');

// Controle do Slider de Imagens (Simulado)
const activeImageIndex = ref<number>(0);
const productImages = [
  'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=600&q=80'
];

// Dados estruturados baseados no mockup
const productData = ref({
  title: 'Calça Jeans preta básica',
  price: 100,
  brand: 'chanel',
  condition: 'Usado',
  description: 'Inspirada no carisma nato de uma vocalista de rock, a Lola é uma favorita cult e a calça skinny de cintura alta icônica da Denim Forum. A Lola tem modelagem ajustada no quadril e na coxa, com perna skinny que termina no tornozelo. Bolsos inovadores com contornos e o tecido Best Asset™ abraçam e levantam, criando curvas nos lugares certos. Ela é feita com algodão orgânico italiano premium que fica ainda melhor com o tempo — o equivalente em jeans ao rock clássico. Esta versão vem em preto lavado e tem barra reta.',
  specifications: [
    'Corte: Skinny',
    'Cintura: 28 cm',
    'Comprimento da perna: Skinny',
    'Comprimento: 75 cm',
    'A modelo mede 1,74 m e veste tamanho 25'
  ],
  shippingDetails: [
    'Pedidos a partir de US$ 50 têm frete padrão grátis.',
    'Entrega padrão em 4 a 5 dias úteis.',
    'Entrega expressa em 2 a 4 dias úteis.',
    'Os pedidos são processados e entregues de segunda a sexta-feira (exceto feriados).'
  ]
});

// Carrossel de Parecidos
const similarItems = ref([
  { id: 1, name: 'The Lola High Rise Skinny 30L', price: 76.44, img: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=300&q=80' },
  { id: 2, name: 'The Yoko High Rise Slim 26L', price: 100.00, img: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=300&q=80' },
  { id: 3, name: 'The Long Skinny Rock', price: 100.00, img: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=300&q=80' }
]);

// Funções de clique dos botões
const goBack = () => alert('Voltar para a lista anterior');
const toggleFavorite = () => alert('Adicionado aos favoritos!');
const openCart = () => alert('Abrindo o carrinho...');
const openReviews = () => alert('Abrindo modal de avaliações!');

const handleSizeSelection = (size: string) => {
  chosenSize.value = size;
  console.log(`Tamanho atualizado na View principal: ${size}`);
};
</script>

<template>
  <div class="product-page-container">

    <header class="app-header">
      <button class="icon-btn" @click="goBack">←</button>
      <div class="header-actions">
        <button class="icon-btn" @click="toggleFavorite">♡</button>
        <button class="icon-btn" @click="openCart">🛒</button>
      </div>
    </header>

    <main class="scrollable-content">

      <div class="image-slider-wrapper">
        <img :src="productImages[activeImageIndex]" alt="Imagem do Produto" class="main-product-image" />
        <div class="slider-dots">
          <span
            v-for="(img, idx) in productImages"
            :key="idx"
            class="dot"
            :class="{ active: activeImageIndex === idx }"
            @click="activeImageIndex = idx"
          ></span>
        </div>
      </div>

      <section class="basic-info-section">
        <h1 class="product-title">{{ productData.title }}</h1>
        <div class="rating-container">
          <span>★★★★☆</span>
        </div>
        <p class="product-price">${{ productData.price }}</p>
      </section>

      <hr class="divider" />

      <section class="similar-section">
        <h2>Parecidos</h2>
        <div class="horizontal-scroll">
          <div v-for="item in similarItems" :key="item.id" class="similar-card">
            <img :src="item.img" alt="Similar item" />
            <p class="similar-name">{{ item.name }}</p>
            <p class="similar-price">${{ item.price }}</p>
          </div>
        </div>
      </section>

      <section class="detail-section">
        <h2>DESCRIÇÃO</h2>
        <p class="description-text">{{ productData.description }}</p>
      </section>

      <section class="detail-section">
        <h2>MARCA</h2>
        <p class="brand-text">• {{ productData.brand }}</p>
      </section>

      <section class="detail-section">
        <h2>CONDIÇÃO DO PRODUTO</h2>
        <span class="badge-condition">{{ productData.condition }}</span>
      </section>

      <section class="detail-section">
        <h2>SIZE</h2>
        <ul class="bullet-list">
          <li v-for="(spec, index) in productData.specifications" :key="index">{{ spec }}</li>
        </ul>
      </section>

      <section class="detail-section">
        <h2>SHIPPING AND RETURN</h2>
        <ul class="bullet-list">
          <li v-for="(ship, index) in productData.shippingDetails" :key="index">{{ ship }}</li>
        </ul>
      </section>

      <section class="reviews-section" @click="openReviews">
        <div class="reviews-header">
          <span>Reviews (9)</span>
          <span>★★★★☆ &nbsp; →</span>
        </div>
      </section>
    </main>

    <footer class="sticky-footer">
      <button class="btn-full-width" @click="isBottomSheetOpen = true">
        SELECIONE O TAMANHO ({{ chosenSize }})
      </button>
    </footer>

    <SizeBottomSheetComponent
      :is-open="isBottomSheetOpen"
      @close="isBottomSheetOpen = false"
      @sizeSelected="handleSizeSelection"
    />
  </div>
</template>

<style scoped>
@import '../css/product-detail.css';
</style>
