<script setup lang="ts">
import blusa from '@/assets/roupas/blusalaranjabasica.png'
import jeans from '@/assets/roupas/calcajeansskinny.png'
import skinny from '@/assets/roupas/calcaskinny.png'
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()
const route = useRoute()
const API_BASE = import.meta.env.VITE_API_URL ?? ''

interface Categoria {
  id: number
  nome?: string
  name?: string
  title?: string
  imagem_url?: string | null
}

interface Produto {
  id: number
  nome: string
  name?: string
  preco: number
  marca?: string
  imagem_url?: string | null
  imagem?: string
  categoria?: string | number | { id?: number; nome?: string; name?: string; title?: string }
  category?: string | number | { id?: number; nome?: string; name?: string; title?: string }
  categoria_id?: number | string
  category_id?: number | string
  categoria_nome?: string
  categoriaNome?: string
  categoria_name?: string
  genero?: string
  tipo?: string
}

const search = ref('')
const categorias = ref<Categoria[]>([])
const categoriaSelecionada = ref<Categoria | null>(null)
const showCategorias = ref(false)
const produtos = ref<Produto[]>([])
const recentes = ref<string[]>([])

const RECENTES_KEY = 'recent_searches_v1'
const LEGACY_KEYS = ['recent_searches', 'recentSearches', 'recent_searches_v1']
const DEFAULT_RECENTES = ['Calças', 'Blusas', 'Sapatos', 'Jaqueta']

const fallbackCategorias: Categoria[] = [
  { id: 1, nome: 'Casual', imagem_url: 'https://placehold.co/80x80?text=Casual' },
  { id: 2, nome: 'Streetwear', imagem_url: 'https://placehold.co/80x80?text=Street' },
  { id: 3, nome: 'Formal', imagem_url: 'https://placehold.co/80x80?text=Formal' },
  { id: 4, nome: 'Vintage', imagem_url: 'https://placehold.co/80x80?text=Vintage' },
  { id: 5, nome: 'Praia', imagem_url: 'https://placehold.co/80x80?text=Praia' },
]

const parseRecentes = (raw: string | null): string[] | null => {
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed) && parsed.every((item) => typeof item === 'string')) {
      return parsed
    }
  } catch (e) {
    void e
  }
  return null
}

const carregarRecentes = () => {
  for (const key of LEGACY_KEYS) {
    const raw = localStorage.getItem(key)
    const parsed = parseRecentes(raw)
    if (parsed) {
      recentes.value = parsed
      if (key !== RECENTES_KEY) {
        salvarRecentesNoStorage()
      }
      return
    }
  }

  recentes.value = DEFAULT_RECENTES
}

const salvarRecentesNoStorage = () => {
  try {
    localStorage.setItem(RECENTES_KEY, JSON.stringify(recentes.value.slice(0, 20)))
  } catch (e) {
    void e
  }
}

const mockProdutos: Produto[] = [
  {
    id: 1,
    nome: 'Blusa Laranja Básica',
    preco: 50,
    marca: 'Nike',
    categoria: 'camiseta',
    genero: 'feminino',
    imagem: blusa,
  },
  {
    id: 2,
    nome: 'Calça Jeans Skinny',
    preco: 90,
    marca: 'Zara',
    categoria: 'calca',
    genero: 'feminino',
    imagem: jeans,
  },
  {
    id: 3,
    nome: 'Calça Skinny',
    preco: 70,
    marca: 'Shein',
    categoria: 'calca',
    genero: 'feminino',
    imagem: skinny,
  },
]

const normalizeText = (texto: string) =>
  texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()

const formatMediaUrl = (url?: string | null) => {
  if (!url) return 'https://placehold.co/100x100?text=Foto'
  return url.startsWith('http') ? url : `${API_BASE}${url}`
}

const getCategoriaNome = (item: Categoria | null) => {
  if (!item) return ''
  return item.nome || item.name || item.title || ''
}

const getResponseList = <T>(data: unknown): T[] => {
  if (!data || typeof data !== 'object') {
    return []
  }

  const response = data as { results?: unknown }
  if (Array.isArray(response.results)) {
    return response.results as T[]
  }

  if (Array.isArray(data)) {
    return data as T[]
  }

  return []
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

  const nomeCategoria = normalizeText(getCategoriaNome(categoriaSelecionada))
  const nomeProduto = normalizeText(
    [
      typeof produto.categoria === 'string' ? produto.categoria : '',
      typeof produto.category === 'string' ? produto.category : '',
      produto.categoria_nome || '',
      produto.categoriaNome || '',
      produto.categoria_name || '',
      produto.nome || produto.name || '',
    ].join(' '),
  )

  return nomeCategoria ? nomeProduto.includes(nomeCategoria) : false
}

const carregarCategorias = async () => {
  try {
    const res = await axios.get(`${API_BASE}/api/categorias/`)
    categorias.value = getResponseList<Categoria>(res.data)
  } catch (error) {
    console.warn('Erro ao carregar categorias:', error)
    categorias.value = []
  }

  if (!categorias.value.length) {
    categorias.value = fallbackCategorias
  }
}

const carregarProdutos = async (q?: string) => {
  try {
    const params = q ? { search: q } : {}
    const res = await axios.get(`${API_BASE}/api/produtos/`, { params })
    produtos.value = getResponseList(res.data)
  } catch (error) {
    console.warn('API indisponível. Usando mock.', error)
    produtos.value = mockProdutos
  }
}

function onImgError(e: Event) {
  const img = e.target as HTMLImageElement | null
  if (img) img.src = 'https://placehold.co/300x300?text=Foto'
}

const aplicarCategoriaDaRota = () => {
  const valorCategoria = typeof route.query.categoria === 'string' ? route.query.categoria : ''
  if (!valorCategoria || !categorias.value.length) {
    return
  }

  const categoriaId = Number(valorCategoria)
  categoriaSelecionada.value =
    categorias.value.find((item) => Number(item.id) === categoriaId) ||
    categorias.value.find((item) => normalizeText(getCategoriaNome(item)) === normalizeText(valorCategoria)) ||
    null
}

watch(
  () => route.query.categoria,
  () => {
    aplicarCategoriaDaRota()
  },
  { immediate: true },
)

const filtrados = computed(() => {
  const busca = normalizeText(search.value)
  const categoriaAtiva = categoriaSelecionada.value

  return produtos.value.filter((p) => {
    const texto = normalizeText(
      [
        p.nome || p.name || '',
        p.marca || '',
        typeof p.categoria === 'string' ? p.categoria : '',
        typeof p.category === 'string' ? p.category : '',
        p.categoria_nome || '',
        p.categoriaNome || '',
        p.categoria_name || '',
        p.genero || '',
        p.tipo || '',
      ].join(' '),
    )

    const matchBusca = !busca || texto.includes(busca)
    const matchCategoria = !categoriaAtiva || produtoPertenceCategoria(p, categoriaAtiva)

    return matchBusca && matchCategoria
  })
})

const showHistorico = computed(() => !search.value.trim() && !categoriaSelecionada.value)

// salvar no histórico
function salvarRecente(valor: string) {
  if (!valor || !valor.trim()) return

  const index = recentes.value.findIndex((r) => r.toLowerCase() === valor.toLowerCase())
  if (index !== -1) {
    recentes.value.splice(index, 1)
  }

  recentes.value.unshift(valor)
  recentes.value = recentes.value.slice(0, 20)
  salvarRecentesNoStorage()
}

// quando digita e dá enter
function pesquisar() {
  if (!search.value.trim()) return

  salvarRecente(search.value)
  carregarProdutos(search.value)
}

// clicar recente
function usarRecente(item: string) {
  search.value = item
  pesquisar()
}

// remover recente
function removerRecente(index: number) {
  recentes.value.splice(index, 1)
  salvarRecentesNoStorage()
}

function selecionarCategoria(item: Categoria) {
  if (categoriaSelecionada.value?.id === item.id) {
    categoriaSelecionada.value = null
  } else {
    categoriaSelecionada.value = item
  }
}

function categoriaAtiva(item: Categoria) {
  return categoriaSelecionada.value?.id === item.id
}

function toggleCategorias() {
  showCategorias.value = !showCategorias.value
}

function voltar() {
  router.back()
}

function abrirProduto(id: number) {
  router.push(`/produto/${id}`)
}

const mostrarModalCamera = ref(false)

function abrirCameraModal() {
  mostrarModalCamera.value = true
}

function fecharModal() {
  mostrarModalCamera.value = false
}

async function irParaCamera(tipo: 'camera' | 'gallery') {
  fecharModal()

  if (tipo === 'gallery') {
    return new Promise<void>((resolve) => {
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = 'image/*'
      input.style.display = 'none'
      document.body.appendChild(input)

      input.onchange = async () => {
        const file = input.files && input.files[0]
        if (file) {
          const reader = new FileReader()
          reader.onload = () => {
            const data = reader.result as string
            try {
              sessionStorage.setItem('camera-image', data)
            } catch (e) {
              console.warn('Não foi possível salvar a imagem no sessionStorage', e)
            }
            document.body.removeChild(input)
            router.push('/pesquisa-camera')
            resolve()
            console.log("IMAGEM SALVA:", data.substring(0, 50))
          }
          reader.readAsDataURL(file)
        } else {
          document.body.removeChild(input)
          resolve()
        }
      }

      input.click()
    })
  }

  router.push({ name: 'camera-search', query: { tipo } })
}

onMounted(async () => {
  carregarRecentes()
  await Promise.all([carregarCategorias(), carregarProdutos()])
  aplicarCategoriaDaRota()
})

</script>
<template>
  <div class="search-page">
    <!-- HEADER -->
    <div class="top-bar">
      <span class="material-symbols-outlined icon-btn" @click="voltar">
        arrow_back
      </span>

      <div class="search-bar">
        <div class="search-input-wrapper">
          <input
            type="text"
            v-model="search"
            @keyup.enter="pesquisar"
            placeholder="Pesquisar itens..."
          />

          <span class="search-icon">
            <svg viewBox="0 0 24 24" fill="none">
              <circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="2" />
              <path
                d="M16.5 16.5L21 21"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
              />
            </svg>
          </span>
        </div>
      </div>

      <span class="material-symbols-outlined filter-button" @click="toggleCategorias">
        filter_alt
      </span>

      <span class="material-symbols-outlined camera-button" @click="abrirCameraModal">
        photo_camera
      </span>
    </div>

    <!-- CATEGORIAS -->
    <div class="categories-row" v-if="showCategorias && categorias.length">
      <button
        type="button"
        v-for="item in categorias"
        :key="item.id"
        :class="['category-chip', { active: categoriaAtiva(item) }]"
        @click="selecionarCategoria(item)"
      >
        <div class="category-image">
          <img
            :src="formatMediaUrl(item.imagem_url)"
            :alt="getCategoriaNome(item) || 'Categoria'"
            @error="onImgError"
          />
        </div>

        <span>{{ getCategoriaNome(item) || "Categoria" }}</span>
      </button>
    </div>

    <!-- RECENTES -->
    <div v-if="showHistorico" class="recentes">
      <p class="recentes-title">Pesquisas recentes</p>

      <div class="recentes-list">
        <div
          class="recente-item"
          v-for="(item, index) in recentes"
          :key="index"
        >
          <span @click="usarRecente(item)">
            {{ item }}
          </span>

          <span @click="removerRecente(index)">×</span>
        </div>
      </div>
    </div>

    <!-- RESULTADOS -->
    <div class="results" v-if="filtrados.length">
      <div
        class="card"
        v-for="item in filtrados"
        :key="item.id"
        @click="abrirProduto(item.id)"
      >
        <img
          :src="item.imagem_url || item.imagem"
          :alt="item.nome"
          @error="onImgError"
        />

        <div class="info">
          <h3>{{ item.nome }}</h3>
          <p class="marca">{{ item.marca }}</p>
          <p class="preco">
            R$ {{ Number(item.preco).toFixed(2) }}
          </p>
        </div>
      </div>
    </div>

    <!-- EMPTY -->
    <div v-if="!filtrados.length" class="empty">
      <p>Nenhum resultado encontrado</p>
    </div>

    <!-- OVERLAY -->
    <div
      v-if="mostrarModalCamera"
      class="camera-overlay"
      @click="fecharModal"
    ></div>

    <!-- MODAL -->
    <div v-if="mostrarModalCamera" class="camera-sheet">
      <button @click="irParaCamera('camera')">
        Tirar foto
      </button>

      <button @click="irParaCamera('gallery')">
        Importar da galeria
      </button>

      <button class="cancel" @click="fecharModal">
        Cancelar
      </button>
    </div>
  </div>
</template>
<style scoped src="../css/search.css"></style>
