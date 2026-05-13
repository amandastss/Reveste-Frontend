<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

// router
const router = useRouter()

// tipagem
type Pergunta = {
  pergunta: string
  resposta: string
  avaliacao: 'sim' | 'nao' | null
}

// estado
const aberto = ref<number | null>(null)

const perguntas = ref<Pergunta[]>([
  {
    pergunta: 'Endereço incorreto e encomendas não entregues',
    resposta: 'Se você inseriu o endereço errado, o pacote pode retornar.',
    avaliacao: null
  },
  {
    pergunta: 'Quanto tempo demora para envio?',
    resposta: 'De 2 a 5 dias úteis.',
    avaliacao: null
  },
  {
    pergunta: 'Como rastrear meu pedido?',
    resposta: 'Você recebe um código por email.',
    avaliacao: null
  }
])

// abrir/fechar
function toggle(index: number) {
  aberto.value = aberto.value === index ? null : index
}

// avaliar (sem erro TS)
function avaliar(index: number, tipo: 'sim' | 'nao') {
  const item = perguntas.value[index]
  if (item) {
    item.avaliacao = tipo
  }
}

// voltar
function voltar() {
  router.back()
}
</script>

<template>
  <div class="categoria">

    <!-- HEADER -->
    <div class="top">
      <span class="material-symbols-outlined back" @click="voltar">
        arrow_back
      </span>
      <h2>ENVIO E ENTREGA</h2>
    </div>

    <!-- FAQ -->
    <div class="faq">
      <div
        v-for="(item, index) in perguntas"
        :key="index"
        class="faq-item"
      >

        <!-- PERGUNTA -->
        <div class="pergunta" @click="toggle(index)">
          <span>{{ item.pergunta }}</span>
          <span class="material-symbols-outlined">
            {{ aberto === index ? 'expand_less' : 'expand_more' }}
          </span>
        </div>

        <!-- RESPOSTA -->
        <div v-if="aberto === index">

          <p class="resposta">{{ item.resposta }}</p>

          <!-- AVALIAÇÃO -->
          <div class="avaliacao">
            <span>Essa resposta te ajudou?</span>

            <div class="botoes">

              <button
                @click="avaliar(index, 'nao')"
                :class="{ nao: item.avaliacao === 'nao' }"
              >
                <span class="material-symbols-outlined">
                  thumb_down
                </span>
              </button>

              <button
                @click="avaliar(index, 'sim')"
                :class="{ sim: item.avaliacao === 'sim' }"
              >
                <span class="material-symbols-outlined">
                  thumb_up
                </span>
              </button>

            </div>
          </div>

          <div v-if="item.avaliacao === 'nao'" class="feedback">
            <span class="material-symbols-outlined icone-triste">
              sentiment_dissatisfied
            </span>

            <p>Sentimos muito por isso :(</p>
            <span>
              Vamos melhorar essa resposta o mais rápido possível.
            </span>
          </div>

        </div>

      </div>
    </div>

  </div>
</template>

<style scoped>
.categoria {
  min-height: 100vh;
  background: white;
  font-family: "Montserrat", sans-serif;
}

/* HEADER */
.top {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px;
  border-bottom: 1px solid #eee;
  position: sticky;
  top: 0;
  background: white;
}

.back {
  cursor: pointer;
  padding: 6px;
  border-radius: 50%;
}

.top h2 {
  font-size: 14px;
  font-weight: 600;
}

/* FAQ */
.faq {
  padding: 10px 16px;
}

.faq-item {
  border-bottom: 1px solid #eee;
  padding: 12px 0;
}

.pergunta {
  display: flex;
  justify-content: space-between;
  cursor: pointer;
  font-weight: 500;
}

/* RESPOSTA */
.resposta {
  margin-top: 8px;
  font-size: 14px;
  color: #666;
}

/* AVALIAÇÃO */
.avaliacao {
  margin-top: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.botoes {
  display: flex;
  gap: 10px;
}

.botoes button {
  border: none;
  background: #f5f5f5;
  border-radius: 50%;
  padding: 8px;
  cursor: pointer;
  transition: 0.2s;
}

.botoes button.sim {
  background: #e6f4ea;
}

.botoes button.sim span {
  color: #2e7d32;
}

.botoes button.nao {
  background: #fdecea;
}

.botoes button.nao span {
  color: #c62828;
}

/* FEEDBACK */
.feedback {
  margin-top: 15px;
  background: #f5f5f5;
  padding: 16px;
  border-radius: 16px;
  text-align: center;
}

.icone-triste {
  font-size: 60px;
  color: #c62828;
  margin-bottom: 10px;
}

.feedback p {
  font-weight: 600;
}

.feedback span {
  font-size: 13px;
  color: #666;
}
</style>