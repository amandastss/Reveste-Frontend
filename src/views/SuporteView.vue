<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const categorias = [
  { label: 'Informações do pedido', route: '/suporte/categoria' },
  { label: 'Pagamento e segurança', route: '/suporte/categoria' },
  { label: 'Compras e entregas', route: '/suporte/categoria' },
  { label: 'Produto e garantia', route: '/suporte/categoria' },
]

const quickPrompts = [
  'Quero rastrear meu pedido',
  'Como funciona o pagamento?',
  'Tenho dúvida sobre tamanho',
]

const aiUrl = computed(() => import.meta.env.VITE_SUPPORT_AI_URL?.trim() || '')
const aiModel = computed(() => import.meta.env.VITE_SUPPORT_AI_MODEL || 'gpt-4o-mini')
const aiApiKey = computed(() => import.meta.env.VITE_SUPPORT_AI_API_KEY?.trim() || '')

const sellerUrl = computed(
  () =>
    import.meta.env.VITE_SUPPORT_CONTACT_SELLER_URL ||
    'https://wa.me/5547999999999?text=Ol%C3%A1%2C%20quero%20ajuda%20sobre%20um%20pedido%20na%20Reveste.',
)

const messages = ref([
  {
    id: 1,
    sender: 'assistant',
    text: 'Oi! Sou a assistente da Reveste. Posso ajudar com pedidos, pagamentos, entregas, trocas e dúvidas sobre produtos.',
  },
])

const draft = ref('')
const isLoading = ref(false)
const messagesContainer = ref<HTMLElement | null>(null)

async function scrollToBottom() {
  await nextTick()

  if (messagesContainer.value) {
    messagesContainer.value.scrollTo({
      top: messagesContainer.value.scrollHeight,
      behavior: 'smooth',
    })
  }
}

function goTo(route: string) {
  router.push(route)
}

function goBack() {
  router.back()
}

function openSellerChat() {
  window.open(sellerUrl.value, '_blank', 'noopener,noreferrer')
}

function addMessage(text: string, sender: 'user' | 'assistant') {
  messages.value.push({
    id: Date.now() + Math.random(),
    sender,
    text,
  })

  scrollToBottom()
}

function normalizeMessage(value: string) {
  return value.trim().replace(/\s+/g, ' ')
}

function fallbackSupportReply(prompt: string) {
  const lowerPrompt = prompt.toLowerCase()

  if (
    lowerPrompt.includes('pedido') ||
    lowerPrompt.includes('rastreio') ||
    lowerPrompt.includes('entrega')
  ) {
    return 'Para rastrear seu pedido, você pode abrir a área de pedidos na sua conta e ver o status atualizado. Se ainda estiver com dúvida, me diga o número do pedido ou o nome do produto que você comprou.'
  }

  if (
    lowerPrompt.includes('pagamento') ||
    lowerPrompt.includes('segurança') ||
    lowerPrompt.includes('cartão')
  ) {
    return 'Na Reveste, o pagamento é processado com segurança e as informações do cartão são protegidas. Se o problema for na transação, me diga o valor aproximado e o método de pagamento para te orientar melhor.'
  }

  if (
    lowerPrompt.includes('tamanho') ||
    lowerPrompt.includes('produto') ||
    lowerPrompt.includes('medida')
  ) {
    return 'Para escolher o tamanho certo, compare as medidas da peça com as suas medidas e confira a tabela do produto. Se quiser, posso te ajudar a comparar opções de tamanho com base no item que você está vendo.'
  }

  if (
    lowerPrompt.includes('troca') ||
    lowerPrompt.includes('devolução') ||
    lowerPrompt.includes('cancel')
  ) {
    return 'Posso te orientar sobre trocas, devoluções e cancelamentos. Me diga qual foi o motivo e se o pedido já foi entregue ou ainda está em processamento.'
  }

  return 'Posso te ajudar com pedidos, pagamentos, entregas, produtos, trocas e garantia. Me diga o que você está procurando e eu te explico o melhor caminho.'
}

async function getAssistantReply(prompt: string) {
  const cleanedPrompt = normalizeMessage(prompt)

  if (!cleanedPrompt) {
    return 'Claro! Me diga em uma frase qual é sua dúvida sobre o pedido, produto ou pagamento.'
  }

  if (aiUrl.value) {
    const endpoint = aiUrl.value.replace(/\/+$/, '')
    const requestUrl = endpoint.includes('/chat/completions')
      ? endpoint
      : `${endpoint}/chat/completions`

    try {
      const response = await fetch(requestUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(aiApiKey.value ? { Authorization: `Bearer ${aiApiKey.value}` } : {}),
        },
        body: JSON.stringify({
          model: aiModel.value,
          messages: [
            {
              role: 'system',
              content:
                'Você é a assistente de suporte da Reveste, uma loja de moda online. Responda de forma útil, amigável e objetiva em português do Brasil. Foque em pedidos, pagamentos, entregas, trocas, garantia e dúvidas sobre produtos. Se não souber detalhes, peça informações curtas e úteis.',
            },
            { role: 'user', content: cleanedPrompt },
          ],
          temperature: 0.6,
        }),
      })

      if (!response.ok) {
        throw new Error(`Erro ao consultar IA: ${response.status}`)
      }

      const data = await response.json()

      const text =
        data.choices?.[0]?.message?.content ||
        data.message?.content ||
        data.reply ||
        data.output_text ||
        ''

      if (typeof text === 'string' && text.trim()) {
        return text.trim()
      }
    } catch (error) {
      console.warn('Falha ao usar IA de suporte, usando resposta local.', error)
    }
  }

  return fallbackSupportReply(cleanedPrompt)
}

async function handleQuickPrompt(prompt: string) {
  draft.value = prompt
  submitMessage()
}

async function submitMessage() {
  const prompt = normalizeMessage(draft.value)

  if (!prompt || isLoading.value) {
    return
  }

  addMessage(prompt, 'user')
  draft.value = ''
  isLoading.value = true

  try {
    const reply = await getAssistantReply(prompt)
    addMessage(reply, 'assistant')
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="suporte">
    <header class="header">
      <div class="header-visual">
        <img src="/suporte.png" alt="Suporte Reveste" />
        <div class="overlay"></div>
        <div class="header-glow"></div>
      </div>

      <button class="back-button" @click="goBack" aria-label="Voltar">
        <span class="material-symbols-outlined">arrow_back</span>
      </button>

      <div class="header-content">
        <p class="eyebrow">Atendimento</p>
        <h1>Como podemos<br />te ajudar?</h1>
      </div>
    </header>

    <main class="content">
      <section class="card categories-card">
        <p class="titulo">Eu preciso de ajuda:</p>

        <div
          v-for="(item, index) in categorias"
          :key="index"
          class="item"
          @click="goTo(item.route)"
        >
          <span>{{ item.label }}</span>
          <span class="material-symbols-outlined arrow">chevron_right</span>
        </div>
      </section>

      <section class="chat-card">
        <div class="chat-header">
          <div class="assistant-tag">
            <span class="material-symbols-outlined">smart_toy</span>
            Assistente Reveste
          </div>

          <span class="status-pill" :class="{ online: aiUrl }">
            {{ aiUrl ? 'IA ativa' : 'Guia rápido' }}
          </span>
        </div>

        <div ref="messagesContainer" class="messages">
          <div
            v-for="message in messages"
            :key="message.id"
            class="bubble"
            :class="message.sender"
          >
            {{ message.text }}
          </div>

          <div v-if="isLoading" class="bubble assistant typing">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>

        <div class="quick-actions">
          <button
            v-for="prompt in quickPrompts"
            :key="prompt"
            type="button"
            class="quick-pill"
            @click="handleQuickPrompt(prompt)"
          >
            {{ prompt }}
          </button>
        </div>

        <div class="composer">
          <input
            v-model="draft"
            type="text"
            placeholder="Digite sua dúvida..."
            @keyup.enter="submitMessage"
          />

          <button
            type="button"
            class="send-button"
            @click="submitMessage"
            :disabled="isLoading || !draft.trim()"
          >
            <span class="material-symbols-outlined">send</span>
          </button>
        </div>
      </section>

      <button class="seller-button" @click="openSellerChat">
        <span class="material-symbols-outlined">storefront</span>
        Falar com o vendedor
      </button>
    </main>
  </div>
</template>

<style scoped>
.suporte {
  min-height: 100vh;
  background: linear-gradient(180deg, var(--app-bg) 0%, var(--surface-elevated) 100%);
  display: flex;
  flex-direction: column;
  font-family: 'Montserrat', sans-serif;
}

.header {
  position: relative;
  height: 220px;
  width: 100%;
}

.header-visual {
  position: absolute;
  inset: 0;
  overflow: hidden;
}

.header img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  filter: none;
  transform: none;
}

.overlay {
  display: none;
}

.header-glow {
  display: none;
}

.back-button {
  position: absolute;
  top: 16px;
  left: 16px;
  width: 42px;
  height: 42px;
  border-radius: 50%;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.18);
  backdrop-filter: blur(8px);
  color: white;
  z-index: 2;
  cursor: pointer;
  box-shadow: 0 10px 18px rgba(15, 23, 42, 0.2);
}

.header-content {
  position: absolute;
  left: 20px;
  bottom: 22px;
  z-index: 2;
  color: white;
}

.eyebrow {
  margin: 0 0 8px;
  font-size: 12px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  opacity: 0.8;
}

.header h1 {
  margin: 0;
  font-size: clamp(1.8rem, 4vw, 2.5rem);
  line-height: 1.1;
  font-weight: 700;
}

.content {
  width: min(100%, 1120px);
  margin: 24px auto 0;
  padding: 0 16px 28px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.card,
.chat-card,
.seller-button {
  background: var(--surface-bg);
  border: 1px solid var(--border-color);
  box-shadow: 0 20px 35px var(--shadow-color);
}

.categories-card {
  border-radius: 24px 24px 20px 20px;
  padding: 20px 18px 8px;
}

.titulo {
  margin: 0 0 8px;
  font-size: 14px;
  color: var(--text-muted);
  font-weight: 600;
}

.item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 16px 4px;
  border-bottom: 1px solid var(--border-color);
  font-size: 0.98rem;
  cursor: pointer;
  color: var(--text-color);
}

.item:last-child {
  border-bottom: none;
}

.arrow {
  color: #a0a8b5;
  font-size: 1.1rem;
}

.chat-card {
  border-radius: 24px;
  padding: 18px 16px 14px;
}

.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
}

.assistant-tag {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: var(--text-color);
}

.assistant-tag .material-symbols-outlined {
  font-size: 18px;
  color: #4f46e5;
}

.status-pill {
  display: inline-flex;
  align-items: center;
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 11px;
  background: rgba(148, 163, 184, 0.12);
  color: var(--text-muted);
  font-weight: 600;
}

.status-pill.online {
  background: rgba(16, 185, 129, 0.12);
  color: #047857;
}

.messages {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 180px;
  max-height: 260px;
  overflow-y: auto;
  padding-right: 4px;
  scroll-behavior: smooth;
}

.bubble {
  max-width: 82%;
  padding: 12px 14px;
  border-radius: 18px;
  line-height: 1.5;
  word-break: break-word;
  font-size: 0.94rem;
}

.bubble.user {
  align-self: flex-end;
  background: linear-gradient(135deg, #111827, #1f2937);
  color: white;
  border-bottom-right-radius: 6px;
}

.bubble.assistant {
  align-self: flex-start;
  background: var(--surface-elevated);
  color: var(--text-color);
  border-bottom-left-radius: 6px;
}

.typing {
  display: flex;
  align-items: center;
  gap: 6px;
  width: 80px;
  justify-content: center;
}

.typing span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #94a3b8;
  animation: pulse 1.2s infinite ease-in-out;
}

.typing span:nth-child(2) {
  animation-delay: 0.15s;
}

.typing span:nth-child(3) {
  animation-delay: 0.3s;
}

@keyframes pulse {
  0%,
  80%,
  100% {
    transform: scale(0.8);
    opacity: 0.45;
  }

  40% {
    transform: scale(1);
    opacity: 1;
  }
}

.quick-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 16px 0 10px;
}

.quick-pill {
  border: 1px solid var(--border-color);
  background: var(--surface-elevated);
  color: var(--text-color);
  border-radius: 999px;
  padding: 8px 12px;
  font-size: 12px;
  cursor: pointer;
}

.composer {
  display: flex;
  align-items: center;
  gap: 10px;
  border: 1px solid var(--border-color);
  border-radius: 18px;
  padding: 8px 8px 8px 12px;
  background: var(--surface-elevated);
}

.composer input {
  flex: 1;
  border: none;
  background: transparent;
  color: var(--text-color);
  font-size: 0.95rem;
  outline: none;
}

.composer input::placeholder {
  color: var(--text-muted);
}

.send-button {
  width: 42px;
  height: 42px;
  border: none;
  border-radius: 14px;
  background: #111827;
  color: white;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.send-button:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.seller-button {
  width: 100%;
  flex-shrink: 0;
  border-radius: 18px;
  padding: 16px 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: var(--text-color);
  font-weight: 700;
  cursor: pointer;
  transition:
    transform 0.15s ease,
    box-shadow 0.2s ease;
  box-shadow: 0 14px 24px rgba(15, 23, 42, 0.08);
}

.seller-button:active {
  transform: scale(0.98);
}

@media (min-width: 900px) {
  .header {
    height: 260px;
  }

  .content {
    display: grid;
    grid-template-columns: minmax(300px, 0.95fr) minmax(420px, 1.45fr);
    align-items: start;
    gap: 22px;
    padding-top: 0;
    margin-top: 24px;
  }

  .categories-card,
  .chat-card,
  .seller-button {
    min-height: 100%;
  }

  .seller-button {
    grid-column: 1 / -1;
    width: 100%;
    max-width: 440px;
    justify-self: center;
  }
}
</style>
