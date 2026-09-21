<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

type Pergunta = {
  pergunta: string
  resposta: string
  avaliacao: 'sim' | 'nao' | null
}

const aberto = ref<number | null>(null)

const perguntas = ref<Pergunta[]>([
  {
    pergunta: 'Endereço incorreto e encomendas não entregues',
    resposta: 'Se você inseriu o endereço errado, o pacote pode retornar.',
    avaliacao: null,
  },
  {
    pergunta: 'Quanto tempo demora para envio?',
    resposta: 'De 2 a 5 dias úteis.',
    avaliacao: null,
  },
  {
    pergunta: 'Como rastrear meu pedido?',
    resposta: 'Você recebe um código por email.',
    avaliacao: null,
  },
])

function toggle(index: number) {
  aberto.value = aberto.value === index ? null : index
}

function avaliar(index: number, tipo: 'sim' | 'nao') {
  const item = perguntas.value[index]

  if (item) {
    item.avaliacao = tipo
  }
}

function voltar() {
  router.back()
}
</script>

<template>
  <div class="categoria">
    <!-- HEADER -->
    <header class="top">
      <button class="back-button" @click="voltar" aria-label="Voltar">
        <span class="material-symbols-outlined"> arrow_back </span>
      </button>

      <div class="top-title">
        <span>SUPORTE</span>
        <h1>Envio e entrega</h1>
      </div>
    </header>

    <!-- CONTEÚDO -->
    <main class="content">
      <div class="intro">
        <p class="eyebrow">DÚVIDAS FREQUENTES</p>

        <h2>Envio e entrega</h2>

        <p>Encontre respostas para as principais dúvidas sobre seus pedidos.</p>
      </div>

      <!-- FAQ -->
      <section class="faq-card">
        <div
          v-for="(item, index) in perguntas"
          :key="index"
          class="faq-item"
          :class="{ aberto: aberto === index }"
        >
          <!-- PERGUNTA -->
          <button class="pergunta" @click="toggle(index)" :aria-expanded="aberto === index">
            <span class="pergunta-text">
              {{ item.pergunta }}
            </span>

            <span class="material-symbols-outlined pergunta-icon">
              {{ aberto === index ? 'expand_less' : 'expand_more' }}
            </span>
          </button>

          <!-- RESPOSTA -->
          <div v-if="aberto === index" class="resposta-area">
            <p class="resposta">
              {{ item.resposta }}
            </p>

            <!-- AVALIAÇÃO -->
            <div class="avaliacao">
              <span class="avaliacao-text"> Essa resposta te ajudou? </span>

              <div class="botoes">
                <button
                  class="avaliacao-button"
                  :class="{ nao: item.avaliacao === 'nao' }"
                  @click.stop="avaliar(index, 'nao')"
                  aria-label="Não ajudou"
                >
                  <span class="material-symbols-outlined"> thumb_down </span>
                </button>

                <button
                  class="avaliacao-button"
                  :class="{ sim: item.avaliacao === 'sim' }"
                  @click.stop="avaliar(index, 'sim')"
                  aria-label="Ajudou"
                >
                  <span class="material-symbols-outlined"> thumb_up </span>
                </button>
              </div>
            </div>

            <!-- FEEDBACK NEGATIVO -->
            <div v-if="item.avaliacao === 'nao'" class="feedback">
              <span class="material-symbols-outlined icone-triste"> sentiment_dissatisfied </span>

              <div>
                <p>Sentimos muito por isso :(</p>

                <span> Vamos melhorar essa resposta o mais rápido possível. </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>
```css
<style scoped>
.categoria {
  min-height: 100vh;
  background: linear-gradient(180deg, var(--app-bg) 0%, var(--surface-elevated) 100%);
  font-family: 'Montserrat', sans-serif;
  color: var(--text-color);
}

.top {
  position: relative;
  width: 100%;
  padding: 18px 16px 20px;
  background: var(--surface-bg);
  border-bottom: 1px solid var(--border-color);
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.04);
}

.back-button {
  position: absolute;
  top: 16px;
  left: 16px;
  width: 42px;
  height: 42px;
  border: none;
  border-radius: 50%;
  background: rgba(15, 23, 42, 0.06);
  color: var(--text-color);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.top-title {
  padding-left: 52px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.top-title span {
  font-size: 11px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--text-muted);
  font-weight: 600;
}

.top-title h1 {
  margin: 0;
  font-size: clamp(1.5rem, 3vw, 2.2rem);
  line-height: 1.1;
  font-weight: 700;
  color: var(--text-color);
}

.content {
  width: min(100%, 1100px);
  margin: 0 auto;
  padding: 20px 16px 32px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.intro,
.faq-card {
  background: var(--surface-bg);
  border: 1px solid var(--border-color);
  border-radius: 24px;
  box-shadow: 0 16px 32px rgba(15, 23, 42, 0.05);
}

.intro {
  padding: 18px 18px 14px;
}

.eyebrow {
  margin: 0 0 8px;
  font-size: 11px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--text-muted);
  font-weight: 700;
}

.intro h2 {
  margin: 0 0 8px;
  font-size: clamp(1.3rem, 2.2vw, 2rem);
  line-height: 1.2;
  color: var(--text-color);
}

.intro p:last-child {
  margin: 0;
  color: var(--text-muted);
  line-height: 1.6;
}

.faq-card {
  overflow: hidden;
}

.faq-item {
  border-bottom: 1px solid var(--border-color);
  background: transparent;
}

.faq-item:last-child {
  border-bottom: none;
}

.faq-item.aberto {
  background: rgba(148, 163, 184, 0.03);
}

.pergunta {
  width: 100%;
  min-height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 18px 18px;
  border: none;
  background: transparent;
  color: var(--text-color);
  font-family: 'Montserrat', sans-serif;
  font-size: 0.96rem;
  font-weight: 600;
  text-align: left;
  cursor: pointer;
}

.pergunta-text {
  flex: 1;
  line-height: 1.4;
}

.pergunta-icon {
  flex-shrink: 0;
  font-size: 22px;
  color: var(--text-muted);
}

.resposta-area {
  padding: 0 18px 18px;
  border-top: 1px solid var(--border-color);
  background: rgba(148, 163, 184, 0.02);
}

.resposta {
  margin: 0;
  padding-top: 18px;
  font-size: 0.9rem;
  line-height: 1.7;
  color: var(--text-muted);
}

.avaliacao {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding-top: 18px;
}

.avaliacao-text {
  font-size: 12px;
  color: var(--text-muted);
  font-weight: 600;
}

.botoes {
  display: flex;
  align-items: center;
  gap: 8px;
}

.avaliacao-button {
  width: 34px;
  height: 34px;
  border: 1px solid var(--border-color);
  border-radius: 50%;
  background: var(--surface-elevated);
  color: var(--text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    border-color 0.2s ease;
}

.avaliacao-button:hover {
  transform: translateY(-1px);
}

.avaliacao-button .material-symbols-outlined {
  font-size: 18px;
}

.avaliacao-button.sim {
  background: rgba(34, 197, 94, 0.1);
  border-color: rgba(34, 197, 94, 0.2);
}

.avaliacao-button.sim span {
  color: #15803d;
}

.avaliacao-button.nao {
  background: rgba(239, 68, 68, 0.08);
  border-color: rgba(239, 68, 68, 0.16);
}

.avaliacao-button.nao span {
  color: #b91c1c;
}

.feedback {
  margin-top: 16px;
  padding: 14px 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  border-radius: 16px;
  background: var(--surface-elevated);
  color: var(--text-color);
  text-align: center;
}

.icone-triste {
  flex-shrink: 0;
  font-size: 28px;
  color: #dc2626;
}

.feedback p {
  margin: 0 0 4px;
  font-size: 12px;
  font-weight: 700;
}

.feedback span {
  font-size: 11px;
  line-height: 1.5;
  color: var(--text-muted);
}

@media (min-width: 900px) {
  .content {
    grid-template-columns: minmax(250px, 320px) minmax(0, 1fr);
    display: grid;
    align-items: start;
    padding-top: 28px;
  }

  .intro {
    position: sticky;
    top: 20px;
  }
}

@media (max-width: 480px) {
  .top {
    padding: 16px 14px 18px;
  }

  .back-button {
    width: 38px;
    height: 38px;
    top: 14px;
    left: 14px;
  }

  .top-title {
    padding-left: 48px;
  }

  .content {
    padding-left: 12px;
    padding-right: 12px;
  }

  .intro,
  .faq-card {
    border-radius: 18px;
  }

  .pergunta {
    padding-left: 14px;
    padding-right: 14px;
    font-size: 0.9rem;
  }

  .resposta-area {
    padding-left: 14px;
    padding-right: 14px;
  }

  .avaliacao {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
