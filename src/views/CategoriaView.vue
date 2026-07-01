<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'

interface Categoria {
  id: number
  nome: string
  name?: string
  title?: string
  imagem_url?: string | null
}

interface Produto {
  id: number
  nome: string
  name?: string
  preco: number
  imagem_url?: string | null
  imagem?: string
  categoria?: string | number | { id?: number }
  categoria_id?: number | string
  categoria_nome?: string
  categoriaNome?: string
  categoria_name?: string
  category?: string | number | { id?: number }
  category_id?: number | string
}

const route = useRoute()
const router = useRouter()

const categoria = ref<Categoria | null>(null)
const produtos = ref<Produto[]>([])
const carregando = ref(true)

const formatMediaUrl = (url?: string | null) => {
  if (!url) return '/default.png'
  return url.startsWith('http') ? url : `${import.meta.env.VITE_API_URL}${url}`
}

const normalizar = (valor?: string | null) => {
  if (!valor) return ''
  return valor
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
}

const getCategoriaNome = (item: Categoria | null) => {
  if (!item) return ''
  return item.nome || item.name || item.title || ''
}

const produtoPertenceCategoria = (produto: Produto, categoriaSelecionada: Categoria | null) => {
  if (!categoriaSelecionada) return false

  const idCategoria = Number(categoriaSelecionada.id)
  const candidatos = [
    produto.categoria_id,
    produto.category_id,
    typeof produto.categoria === 'object' && produto.categoria ? produto.categoria.id : produto.categoria,
    typeof produto.category === 'object' && produto.category ? produto.category.id : produto.category,
    produto.categoria_nome,
    produto.categoriaNome,
    produto.categoria_name,
    typeof produto.categoria === 'string' ? produto.categoria : undefined,
    typeof produto.category === 'string' ? produto.category : undefined,
  ]

  if (candidatos.some((valor) => Number(valor) === idCategoria && Number.isFinite(Number(valor)))) {
    return true
  }

  const nomeCategoria = normalizar(getCategoriaNome(categoriaSelecionada))
  const nomeProduto = normalizar(
    [
      typeof produto.categoria === 'string' ? produto.categoria : '',
      typeof produto.category === 'string' ? produto.category : '',
      produto.categoria_nome || '',
      produto.categoriaNome || '',
      produto.categoria_name || '',
      produto.nome || '',
      produto.name || '',
    ].join(' ')
  )

  if (!nomeCategoria) return false
  return nomeProduto.includes(nomeCategoria)
}

const carregarCategoria = async () => {
  carregando.value = true

  try {
    const [resCategorias, resProdutos] = await Promise.all([
      axios.get(`${import.meta.env.VITE_API_URL}/api/categorias/`),
      axios.get(`${import.meta.env.VITE_API_URL}/api/produtos/`),
    ])

    const categoriasApi = Array.isArray(resCategorias.data?.results)
      ? resCategorias.data.results
      : Array.isArray(resCategorias.data)
        ? resCategorias.data
        : []

    const produtosApi = Array.isArray(resProdutos.data?.results)
      ? resProdutos.data.results
      : Array.isArray(resProdutos.data)
        ? resProdutos.data
        : []

    const categoriaId = Number(route.params.id)
    categoria.value = categoriasApi.find((item: Categoria) => Number(item.id) === categoriaId) || null

    produtos.value = produtosApi.filter((produto: Produto) => produtoPertenceCategoria(produto, categoria.value))
  } catch (error) {
    console.error('Erro ao carregar categoria:', error)
    produtos.value = []
  } finally {
    carregando.value = false
  }
}

const voltar = () => router.back()

const abrirProduto = (id: number) => {
  router.push({ name: 'produto-detalhe', params: { id } })
}

const tituloCategoria = computed(() => getCategoriaNome(categoria.value))

onMounted(() => {
  carregarCategoria()
})
</script>

<template>
  <div class="categoria-page">
    <div class="header">
      <button class="back" @click="voltar">←</button>
      <h2>{{ tituloCategoria || 'Categoria' }}</h2>
    </div>

    <p v-if="carregando" class="status">Carregando produtos...</p>

    <div v-else-if="!produtos.length" class="empty">
      <p>Nenhum produto encontrado para esta categoria.</p>
    </div>

    <div v-else class="products">
      <div v-for="produto in produtos" :key="produto.id" class="card" @click="abrirProduto(produto.id)">
        <img :src="formatMediaUrl(produto.imagem_url || produto.imagem)" :alt="produto.nome || produto.name" />
        <div class="info">
          <h3>{{ produto.nome || produto.name }}</h3>
          <p class="price">R$ {{ Number(produto.preco).toFixed(2) }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.categoria-page {
  padding: 16px 12px 80px;
  background: white;
  font-family: 'Montserrat', sans-serif;
}

.header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
}

.back {
  border: none;
  background: #f2f2f2;
  border-radius: 999px;
  width: 36px;
  height: 36px;
  font-size: 18px;
  cursor: pointer;
}

h2 {
  margin: 0;
  font-size: 18px;
}

.status,
.empty {
  color: #666;
  text-align: center;
  padding: 24px 0;
}

.products {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.card {
  border: 1px solid #eee;
  border-radius: 14px;
  overflow: hidden;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.card img {
  width: 100%;
  height: 160px;
  object-fit: cover;
  display: block;
  background: #f7f7f7;
}

.info {
  padding: 10px;
}

.info h3 {
  font-size: 14px;
  margin: 0 0 6px;
}

.price {
  margin: 0;
  font-weight: 600;
  color: #111;
}

@media (max-width: 480px) {
  .products {
    grid-template-columns: 1fr;
  }
}
</style>
