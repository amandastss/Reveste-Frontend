<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api, { API_BASE, getStoredToken } from '@/api/config'

interface UsuarioResumo {
  id?: number | string
  name?: string
  nome?: string
  email?: string
  username?: string
}

interface PerguntaApi {
  id: number
  produto?: number | string | { id?: number | string }
  produto_id?: number | string
  texto?: string
  text?: string
  resposta?: string | null
  answer?: string | null
  usuario?: UsuarioResumo & {
    foto?: string
    photo?: string
    profile_image?: string
    avatar?: string
    image?: string
  } | null
  user?: UsuarioResumo & {
    foto?: string
    photo?: string
    profile_image?: string
    avatar?: string
    image?: string
  } | null
  usuario_id?: number | string | null
  user_id?: number | string | null
  created_at?: string
  createdAt?: string
  data_criacao?: string
}

interface Pergunta {
  id: number
  productId: number
  userName: string
  userId: string
  userPhoto: string
  text: string
  answer: string
  createdAt: string
}

const router = useRouter()
const route = useRoute()
const produtoId = Number(route.params.id || 0)
const isAddingQuestion = ref(false)
const newQuestionText = ref('')
const answerDrafts = ref<Record<number, string>>({})
const perguntas = ref<Pergunta[]>([])
const perguntaSelecionadaId = ref<number | null>(null)
const isLoggedIn = computed(() => Boolean(getStoredToken()))

const ensureAuthenticated = () => {
  if (!isLoggedIn.value) {
    alert('Você precisa entrar para ver ou enviar perguntas.')
    router.push('/auth/email')
    return false
  }

  return true
}

const currentUser = computed(() => {
  try {
    const rawUser = localStorage.getItem('user')
    if (!rawUser) return null
    return JSON.parse(rawUser) as { id?: number | string; name?: string; email?: string }
  } catch {
    return null
  }
})

const normalizePergunta = (item: PerguntaApi): Pergunta => {
  const user = item.usuario ?? item.user ?? null
  const productId = Number(item.produto_id ?? item.produto ?? produtoId)
  const rawUserPhoto =
    user?.foto ??
    user?.photo ??
    user?.profile_image ??
    user?.avatar ??
    user?.image ??
    ''

  return {
    id: Number(item.id),
    productId: Number.isFinite(productId) ? productId : produtoId,
    userName:
      user?.name ??
      user?.nome ??
      user?.username ??
      'Usuário',
    userId: String(item.usuario_id ?? item.user_id ?? user?.id ?? 'usuario'),
    userPhoto: rawUserPhoto.startsWith('http') ? rawUserPhoto : rawUserPhoto ? `${API_BASE}${rawUserPhoto}` : '/default.png',
    text: item.texto ?? item.text ?? 'Pergunta sem texto.',
    answer: item.resposta ?? item.answer ?? '',
    createdAt:
      item.created_at ?? item.createdAt ?? item.data_criacao ?? new Date().toISOString(),
  }
}

const totalPerguntas = computed(() => perguntas.value.length)

const carregarPerguntas = async () => {
  if (!produtoId) return
  if (!ensureAuthenticated()) {
    perguntas.value = []
    return
  }

  try {
    const response = await api.get('/perguntas/', {
      params: { produto_id: produtoId },
    })

    const payload = response.data
    const items: PerguntaApi[] = Array.isArray(payload)
      ? payload
      : Array.isArray(payload?.results)
        ? payload.results
        : []

    perguntas.value = items
      .map((item: PerguntaApi) => normalizePergunta(item))
      .sort((a: Pergunta, b: Pergunta) => {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      })
  } catch (error) {
    console.error('Erro ao buscar perguntas:', error)
    perguntas.value = []
  }
}

const enviarPergunta = async () => {
  const texto = newQuestionText.value.trim()
  if (!texto) {
    alert('Escreva sua pergunta antes de enviar.')
    return
  }

  if (!ensureAuthenticated()) {
    return
  }

  try {
    await api.post('/perguntas/', {
      produto: produtoId,
      texto,
    })

    newQuestionText.value = ''
    isAddingQuestion.value = false
    await carregarPerguntas()
  } catch (error) {
    console.error('Erro ao enviar pergunta:', error)
    alert('Não foi possível enviar a pergunta. Tente novamente.')
  }
}

const responderPergunta = async (perguntaId: number) => {
  const resposta = (answerDrafts.value[perguntaId] || '').trim()
  if (!resposta) {
    alert('Escreva uma resposta antes de enviar.')
    return
  }

  if (!ensureAuthenticated()) {
    return
  }

  try {
    await api.patch(`/perguntas/${perguntaId}/responder/`, {
      resposta,
    })

    answerDrafts.value = { ...answerDrafts.value, [perguntaId]: '' }
    await carregarPerguntas()
  } catch (error) {
    console.error('Erro ao responder pergunta:', error)
    alert('Não foi possível salvar a resposta.')
  }
}

const voltar = () => router.back()

onMounted(() => {
  const focoPergunta = Number(route.query.pergunta_id || 0)
  if (focoPergunta) {
    perguntaSelecionadaId.value = focoPergunta
  }

  void carregarPerguntas().then(() => {
    const targetId = Number(route.query.pergunta_id || 0)
    if (!targetId) return

    requestAnimationFrame(() => {
      const el = document.getElementById(`pergunta-${targetId}`)
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    })
  })
})
</script>

<template>
  <div class="reviews-page-container">
    <header class="reviews-header">
      <button class="btn-back" @click="voltar">←</button>
      <h1>Perguntas ao vendedor</h1>
      <button v-if="isLoggedIn" class="btn-action" @click="isAddingQuestion = true">
        ENVIAR
      </button>
    </header>

    <main class="reviews-content">
      <template v-if="!isLoggedIn">
        <div class="form-container-desktop">
          <div class="empty-state-box">
            Faça login para ver e enviar perguntas sobre este produto.
          </div>
          <div class="form-group" style="margin-top: 16px;">
            <button class="btn-action full-width" @click="router.push('/auth/email')">
              Entrar
            </button>
          </div>
        </div>
      </template>

      <template v-else-if="isAddingQuestion">
        <div class="form-container-desktop">
          <div class="form-group">
            <label class="form-label">
              Sua pergunta <span class="required">*</span>
            </label>
            <textarea
              v-model="newQuestionText"
              placeholder="Ex.: Esse produto vem no tamanho M ou G?"
              class="review-textarea"
            />
          </div>

          <div class="form-group">
            <button class="btn-action full-width" @click="enviarPergunta">Enviar pergunta</button>
          </div>
        </div>
      </template>

      <template v-else>
        <div class="reviews-list">
          <div class="reviews-count-title">
            {{ totalPerguntas }} pergunta{{ totalPerguntas === 1 ? '' : 's' }}
          </div>

          <div v-if="!perguntas.length" class="empty-state-box">
            Ainda não há perguntas para este produto.
          </div>

          <div
            v-for="pergunta in perguntas"
            :key="pergunta.id"
            :id="`pergunta-${pergunta.id}`"
            :class="['review-item', { 'selected-question': perguntaSelecionadaId === pergunta.id }]"
          >
            <div class="review-user-row">
              <div class="user-avatar-wrap">
                <img :src="pergunta.userPhoto" :alt="pergunta.userName" class="user-avatar" />
              </div>
              <div class="user-meta">
                <span class="user-name">{{ pergunta.userName }}</span>
                <span class="review-date">
                  {{ new Date(pergunta.createdAt).toLocaleDateString('pt-BR') }}
                </span>
              </div>
            </div>

            <p class="review-text">{{ pergunta.text }}</p>

            <div v-if="pergunta.answer" class="answer-box">
              <strong>Resposta do vendedor:</strong>
              <p>{{ pergunta.answer }}</p>
            </div>

            <div v-else-if="isLoggedIn" class="seller-answer-box">
              <textarea
                v-model="answerDrafts[pergunta.id]"
                rows="3"
                placeholder="Escreva a resposta do vendedor..."
                class="review-textarea"
              />
              <button class="btn-action full-width" @click="responderPergunta(pergunta.id)">
                Responder
              </button>
            </div>
          </div>
        </div>
      </template>
    </main>
  </div>
</template>

<style scoped>
@import '../css/reviews.css';

.full-width {
  width: 100%;
}

.empty-state-box {
  background: rgba(148, 163, 184, 0.08);
  border: 1px solid rgba(148, 163, 184, 0.16);
  border-radius: 16px;
  padding: 18px 16px;
  color: var(--text-muted);
  font-size: 0.95rem;
}

.review-user-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.user-avatar-wrap {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  overflow: hidden;
  background: rgba(148, 163, 184, 0.15);
  border: 1px solid rgba(148, 163, 184, 0.24);
  flex-shrink: 0;
}

.user-avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.user-meta {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.answer-box {
  margin-top: 12px;
  padding: 12px 14px;
  border-radius: 12px;
  background: rgba(34, 197, 94, 0.08);
  border: 1px solid rgba(34, 197, 94, 0.12);
}

.answer-box strong {
  display: block;
  margin-bottom: 6px;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #1b8a5a;
}

.answer-box p {
  margin: 0;
  line-height: 1.5;
}

.seller-answer-box {
  margin-top: 12px;
}

.selected-question {
  background: rgba(59, 130, 246, 0.04);
  border: 1px solid rgba(59, 130, 246, 0.18);
  border-radius: 12px;
  box-shadow: 0 0 0 1px rgba(59, 130, 246, 0.12);
}
</style>
