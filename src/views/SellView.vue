
<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import api from '@/api/config'
import '../css/sell.css'

const estaLogado = () => Boolean(localStorage.getItem('token'))

const mostrarLoginAviso = ref(false)

type FormPeca = {
  titulo: string
  descricao: string
  preco: string | number
  condicao: string
  marca: string
  categoria: string
  foto: File | null
}

type ResultadoScanner = {
  aprovado: boolean
  condicao: string
  score: number
  detalhes: string
}

type Categoria = {
  id: number
  nome?: string
  name?: string
  title?: string
}

const fileInput = ref<HTMLInputElement | null>(null)
const preview = ref('')
const analisando = ref(false)
const publicando = ref(false)
const categorias = ref<Categoria[]>([])
const podePublicar = ref(false)
const erroScanner = ref('')
const resultadoIA = ref<ResultadoScanner | null>(null)

const form = ref<FormPeca>({
  titulo: '',
  descricao: '',
  preco: '',
  condicao: '',
  marca: '',
  categoria: '',
  foto: null,
})

const carregarCategorias = async () => {
  try {
    const response = await api.get('/categorias/')

    const dados = response.data

    categorias.value = Array.isArray(dados?.results)
      ? dados.results
      : Array.isArray(dados)
        ? dados
        : []
  } catch (error) {
    console.error('Erro ao carregar categorias:', error)
    categorias.value = []
  }
}

onMounted(() => {
  void carregarCategorias()
})

onBeforeUnmount(() => {
  if (preview.value) {
    URL.revokeObjectURL(preview.value)
  }
})

const abrirGaleria = () => {
  fileInput.value?.click()
}

const limparPreview = () => {
  if (preview.value) {
    URL.revokeObjectURL(preview.value)
    preview.value = ''
  }
}

const previewImagem = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (!file) return

  limparPreview()

  erroScanner.value = ''
  resultadoIA.value = null
  podePublicar.value = false

  form.value.foto = file
  preview.value = URL.createObjectURL(file)

  await analisarRoupaIA()
}

const analisarRoupaIA = async () => {
  if (!form.value.foto) {
    erroScanner.value = 'Selecione uma foto para continuar.'
    return
  }

  analisando.value = true
  erroScanner.value = ''
  resultadoIA.value = null
  podePublicar.value = false

  try {
    // ATENÇÃO: esta avaliação ainda é simulada.
    // Substitua pela chamada ao serviço real de análise de imagens
    // antes de utilizar o resultado como uma avaliação verdadeira.
    await new Promise((resolve) => setTimeout(resolve, 1500))

    const resultadoSimulado: ResultadoScanner = {
      aprovado: true,
      condicao: 'seminovo',
      score: 85,
      detalhes: 'Avaliação simulada. A condição real da peça não foi verificada por IA.',
    }

    resultadoIA.value = resultadoSimulado

    if (resultadoSimulado.aprovado) {
      form.value.condicao = resultadoSimulado.condicao
      podePublicar.value = true
    } else {
      form.value.condicao = ''
      podePublicar.value = false
    }
  } catch (error) {
    console.error('Erro ao analisar imagem:', error)
    erroScanner.value = 'Não foi possível analisar a imagem. Tente novamente.'
    podePublicar.value = false
  } finally {
    analisando.value = false
  }
}

const publicarPeca = async () => {
  if (publicando.value) return

  if (!estaLogado()) {
    mostrarLoginAviso.value = true
    return
  }

  if (!form.value.titulo.trim()) {
    alert('Informe o nome do produto.')
    return
  }

  if (!form.value.descricao.trim()) {
    alert('Informe a descrição do produto.')
    return
  }

  const precoInformado = form.value.preco
  const precoTexto = String(precoInformado).trim()
  const preco = Number(precoTexto.replace(',', '.'))

  if (!precoTexto || !Number.isFinite(preco) || preco <= 0) {
    alert('Informe um preço válido maior que zero.')
    return
  }

  if (!form.value.categoria) {
    alert('Selecione uma categoria para publicar o produto.')
    return
  }

  if (!form.value.foto) {
    alert('Selecione uma foto para o produto.')
    return
  }

  if (!podePublicar.value || !resultadoIA.value?.aprovado) {
    alert('Aguarde a avaliação da imagem antes de publicar.')
    return
  }

  const formData = new FormData()

  formData.append('nome', form.value.titulo.trim())
  formData.append('descricao', form.value.descricao.trim())
  formData.append('preco', preco.toFixed(2))
  formData.append('marca', form.value.marca.trim())
  formData.append('condicao', form.value.condicao)
  formData.append('categoria', form.value.categoria)
  formData.append('imagem', form.value.foto)

  publicando.value = true

  try {
    const response = await api.post('/produtos/', formData)

    console.log('Produto criado:', response.data)

    alert('Produto publicado com sucesso!')

    limparPreview()

    form.value = {
      titulo: '',
      descricao: '',
      preco: '',
      condicao: '',
      marca: '',
      categoria: '',
      foto: null,
    }

    resultadoIA.value = null
    erroScanner.value = ''
    podePublicar.value = false

    if (fileInput.value) {
      fileInput.value.value = ''
    }
  } catch (error: unknown) {
    console.error('Erro ao publicar produto:', error)

    if (axiosErrorMessage(error)) {
      alert(axiosErrorMessage(error))
    } else {
      alert('Não foi possível publicar o produto. Tente novamente.')
    }
  } finally {
    publicando.value = false
  }
}

function axiosErrorMessage(error: unknown): string | null {
  if (
    typeof error === 'object' &&
    error !== null &&
    'response' in error
  ) {
    const response = (
      error as {
        response?: {
          status?: number
          data?: {
            detail?: string
            message?: string
            [key: string]: unknown
          }
        }
      }
    ).response

    if (!response) return null

    const data = response.data

    if (response.status === 401 || response.status === 403) {
      return 'Sua sessão pode ter expirado. Entre novamente e tente publicar.'
    }

    if (typeof data?.detail === 'string') {
      return data.detail
    }

    if (typeof data?.message === 'string') {
      return data.message
    }

    if (data && typeof data === 'object') {
      return Object.entries(data)
        .map(([campo, mensagem]) => {
          const texto = Array.isArray(mensagem)
            ? mensagem.join(', ')
            : String(mensagem)

          return `${campo}: ${texto}`
        })
        .join('\n')
    }

    return `Erro ao publicar o produto (HTTP ${response.status ?? 'desconhecido'}).`
  }

  return null
}
</script>

<template>
  <div class="sell-page">
    <div v-if="mostrarLoginAviso" class="overlay">
      <div
        class="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="login-aviso-titulo"
      >
        <h2 id="login-aviso-titulo">Ops!</h2>
        <p>Você precisa estar logado para vender uma peça.</p>

        <button type="button" @click="$router.push('/auth-email')">
          Entrar / Criar conta
        </button>

        <button
          type="button"
          @click="mostrarLoginAviso = false"
        >
          Fechar
        </button>
      </div>
    </div>

    <header class="top-bar">
      <button
        type="button"
        class="back-btn"
        aria-label="Voltar"
        @click="$router.back()"
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <line x1="19" y1="12" x2="5" y2="12" />
          <polyline points="12 19 5 12 12 5" />
        </svg>
      </button>

      <h1>Vender</h1>
    </header>

    <form class="sell-form" @submit.prevent="publicarPeca">
      <div class="field-group">
        <label for="titulo">NOME DO PRODUTO</label>
        <input
          id="titulo"
          v-model="form.titulo"
          type="text"
          maxlength="150"
          required
        />
      </div>

      <div class="field-group">
        <label for="descricao">DESCRIÇÃO</label>
        <textarea
          id="descricao"
          v-model="form.descricao"
          maxlength="300"
          required
        />

        <p class="character-count">
          {{ form.descricao.length }}/300
        </p>
      </div>

      <div class="field-group">
        <label for="preco">PREÇO (R$)</label>
        <input
          id="preco"
          v-model="form.preco"
          type="number"
          min="0.01"
          step="0.01"
          required
        />
      </div>

      <div class="field-group">
        <label for="marca">MARCA</label>
        <input
          id="marca"
          v-model="form.marca"
          type="text"
          maxlength="100"
        />
      </div>

      <div class="field-group">
        <label for="categoria">CATEGORIA</label>

        <select
          id="categoria"
          v-model="form.categoria"
          required
        >
          <option value="">Selecione uma categoria</option>

          <option
            v-for="categoria in categorias"
            :key="categoria.id"
            :value="String(categoria.id)"
          >
            {{ categoria.nome || categoria.name || categoria.title || `Categoria ${categoria.id}` }}
          </option>
        </select>

        <p v-if="categorias.length === 0">
          Nenhuma categoria disponível. Verifique sua conexão com a API.
        </p>
      </div>

      <div class="field-group">
        <label for="condicao">CONDIÇÃO</label>

        <input
          id="condicao"
          v-model="form.condicao"
          type="text"
          readonly
          placeholder="Aguardando avaliação da imagem"
        />
      </div>

      <div class="field-group photos">
        <label>FOTOS</label>

        <div class="photo-tips">
          <p>Dicas para melhor avaliação da peça:</p>

          <ul>
            <li>Prefira a roupa vestida em alguém</li>
            <li>Use fundo branco ou neutro</li>
            <li>Garanta boa iluminação</li>
            <li>Mostre frente, costas e detalhes</li>
            <li>Evite fotos tremidas</li>
          </ul>
        </div>

        <button
          type="button"
          class="icon-btn"
          @click="abrirGaleria"
        >
          Escolher foto
        </button>

        <input
          ref="fileInput"
          type="file"
          accept="image/*"
          capture="environment"
          class="hidden-input"
          @change="previewImagem"
        />

        <div v-if="preview" class="preview-box">
          <img :src="preview" alt="Pré-visualização da foto do produto" />
        </div>

        <div v-if="analisando" class="scanner-status" role="status">
          Analisando imagem...
        </div>

        <div v-if="resultadoIA" class="scanner-result">
          <p>
            <strong>Condição:</strong>
            {{ resultadoIA.condicao }}
          </p>

          <p>
            <strong>Score:</strong>
            {{ resultadoIA.score }}%
          </p>

          <p>{{ resultadoIA.detalhes }}</p>
        </div>

        <div
          v-if="erroScanner"
          class="scanner-error"
          role="alert"
        >
          {{ erroScanner }}
        </div>
      </div>

      <p
        v-if="resultadoIA && !podePublicar"
        class="scanner-error"
      >
        A peça não atingiu a qualidade mínima para venda.
      </p>

      <div class="publish-wrapper">
        <button
          class="publish-btn"
          type="submit"
          :disabled="!podePublicar || analisando || publicando"
        >
          {{ publicando ? 'Publicando...' : 'Publicar' }}
        </button>
      </div>
    </form>
  </div>
</template>