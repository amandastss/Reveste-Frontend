import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'

export interface Categoria {
  id: number
  nome?: string
  name?: string
  title?: string
  imagem_url?: string | null
}

export interface Produto {
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

export function useSearchPage() {
  const router = useRouter()
  const route = useRoute()
  const API_BASE = import.meta.env.VITE_API_URL ?? ''

  const search = ref('')
  const categorias = ref<Categoria[]>([])
  const categoriaSelecionada = ref<Categoria | null>(null)
  const showCategorias = ref(false)
  const produtos = ref<Produto[]>([])
  const recentes = ref<string[]>([])
  const mostrarModalCamera = ref(false)

  const RECENTES_KEY = 'recent_searches_v1'
  const LEGACY_KEYS = ['recent_searches', 'recentSearches']
  const DEFAULT_RECENTES = ['Calças', 'Blusas', 'Sapatos', 'Jaqueta']

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
    if (!data || typeof data !== 'object') return []

    const response = data as { results?: unknown }
    if (Array.isArray(response.results)) return response.results as T[]
    if (Array.isArray(data)) return data as T[]

    return []
  }

  const parseRecentes = (raw: string | null): string[] | null => {
    if (!raw) return null

    try {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.every((item) => typeof item === 'string')) {
        return parsed
      }
    } catch (error) {
      console.warn('Erro ao parsear pesquisas recentes:', error)
    }

    return null
  }

  const salvarRecentesNoStorage = () => {
    try {
      localStorage.setItem(RECENTES_KEY, JSON.stringify(recentes.value.slice(0, 20)))
    } catch (error) {
      console.warn('Não foi possível salvar histórico:', error)
    }
  }

  const carregarRecentes = () => {
    for (const key of LEGACY_KEYS) {
      const raw = localStorage.getItem(key)
      const parsed = parseRecentes(raw)

      if (parsed) {
        recentes.value = parsed
        if (key !== RECENTES_KEY) salvarRecentesNoStorage()
        return
      }
    }

    recentes.value = DEFAULT_RECENTES
  }

  const produtoPertenceCategoria = (produto: Produto, categoriaAtual: Categoria | null) => {
    if (!categoriaAtual) return false

    const idCategoria = Number(categoriaAtual.id)
    const ids = [
      produto.categoria_id,
      produto.category_id,
      typeof produto.categoria === 'object' ? produto.categoria?.id : produto.categoria,
      typeof produto.category === 'object' ? produto.category?.id : produto.category,
    ].map((valor) => Number(valor))

    if (ids.some((valor) => Number.isFinite(valor) && valor === idCategoria)) return true

    const nomeCategoria = normalizeText(getCategoriaNome(categoriaAtual))
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
      const response = await axios.get(`${API_BASE}/api/categorias/`)
      categorias.value = getResponseList<Categoria>(response.data)
    } catch (error) {
      console.warn('Erro ao carregar categorias:', error)
      categorias.value = []
    }
  }

  const carregarProdutos = async (q?: string) => {
    try {
      const itens: Produto[] = []
      let nextUrl: string | null = `${API_BASE}/api/produtos/`

      while (nextUrl) {
        const response = await axios.get<{ results?: Produto[]; next?: string | null }>(nextUrl, {
          params: q ? { search: q, page_size: 1000 } : { page_size: 1000 },
        })

        const payload = response.data as { results?: Produto[]; next?: string | null }
        const pageItems = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.results)
            ? payload.results
            : []

        itens.push(...(pageItems as Produto[]))

        nextUrl = payload?.next
          ? payload.next.startsWith('http')
            ? payload.next
            : `${API_BASE}${payload.next}`
          : null
      }

      produtos.value = itens
    } catch (error) {
      console.warn('API indisponível. Nenhum produto carregado.', error)
      produtos.value = []
    }
  }

  const onImgError = (event: Event) => {
    const img = event.target as HTMLImageElement | null
    if (img) img.src = 'https://placehold.co/300x300?text=Foto'
  }

  const aplicarCategoriaDaRota = () => {
    const valorCategoria = typeof route.query.categoria === 'string' ? route.query.categoria : ''
    if (!valorCategoria || !categorias.value.length) return

    const categoriaId = Number(valorCategoria)
    categoriaSelecionada.value =
      categorias.value.find((item) => Number(item.id) === categoriaId) ||
      categorias.value.find(
        (item) => normalizeText(getCategoriaNome(item)) === normalizeText(valorCategoria),
      ) ||
      null
  }

  watch(
    () => route.query.categoria,
    () => aplicarCategoriaDaRota(),
    { immediate: true },
  )

  const filtrados = computed(() => {
    const busca = normalizeText(search.value)

    return produtos.value.filter((produto) => {
      const texto = normalizeText(
        [
          produto.nome || produto.name || '',
          produto.marca || '',
          typeof produto.categoria === 'string' ? produto.categoria : '',
          typeof produto.category === 'string' ? produto.category : '',
          produto.categoria_nome || '',
          produto.categoriaNome || '',
          produto.categoria_name || '',
          produto.genero || '',
          produto.tipo || '',
        ].join(' '),
      )

      const matchBusca = !busca || texto.includes(busca)
      const matchCategoria =
        !categoriaSelecionada.value || produtoPertenceCategoria(produto, categoriaSelecionada.value)

      return matchBusca && matchCategoria
    })
  })

  const showHistorico = computed(() => !search.value.trim() && !categoriaSelecionada.value)

  const salvarRecente = (valor: string) => {
    if (!valor?.trim()) return

    const index = recentes.value.findIndex((item) => item.toLowerCase() === valor.toLowerCase())
    if (index !== -1) recentes.value.splice(index, 1)

    recentes.value.unshift(valor)
    recentes.value = recentes.value.slice(0, 20)
    salvarRecentesNoStorage()
  }

  const pesquisar = () => {
    if (!search.value.trim()) return
    salvarRecente(search.value)
    carregarProdutos(search.value)
  }

  const usarRecente = (item: string) => {
    search.value = item
    pesquisar()
  }

  const removerRecente = (index: number) => {
    recentes.value.splice(index, 1)
    salvarRecentesNoStorage()
  }

  const selecionarCategoria = (item: Categoria) => {
    categoriaSelecionada.value = categoriaSelecionada.value?.id === item.id ? null : item
  }

  const categoriaAtiva = (item: Categoria) => categoriaSelecionada.value?.id === item.id

  const toggleCategorias = () => {
    showCategorias.value = !showCategorias.value
  }

  const voltar = () => router.back()

  const abrirProduto = (id: number) => router.push(`/produto/${id}`)

  const abrirCameraModal = () => {
    mostrarModalCamera.value = true
  }

  const fecharModal = () => {
    mostrarModalCamera.value = false
  }

  const limparBusca = () => {
    search.value = ''
  }

  const irParaCamera = (tipo: 'camera' | 'gallery') => {
    fecharModal()

    if (tipo === 'gallery') {
      return new Promise<void>((resolve) => {
        const input = document.createElement('input')
        input.type = 'file'
        input.accept = 'image/*'
        input.style.display = 'none'
        document.body.appendChild(input)

        input.onchange = () => {
          const file = input.files?.[0]
          if (file) {
            const reader = new FileReader()
            reader.onload = () => {
              const data = reader.result as string
              try {
                sessionStorage.setItem('camera-image', data)
              } catch (error) {
                console.warn('Não foi possível salvar a imagem no sessionStorage', error)
              }
              document.body.removeChild(input)
              router.push('/pesquisa-camera')
              resolve()
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

  return {
    search,
    categorias,
    categoriaSelecionada,
    showCategorias,
    produtos,
    recentes,
    mostrarModalCamera,
    filtrados,
    showHistorico,
    formatMediaUrl,
    getCategoriaNome,
    onImgError,
    categoriaAtiva,
    selecionarCategoria,
    toggleCategorias,
    voltar,
    abrirProduto,
    pesquisar,
    usarRecente,
    removerRecente,
    limparBusca,
    irParaCamera,
    abrirCameraModal,
    fecharModal,
  }
}
