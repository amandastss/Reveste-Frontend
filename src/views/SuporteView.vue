<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const categorias = [
  { label: 'Informações do pedido', route: '/suporte/categoria/informacoes' },
  { label: 'Pagamento e segurança', route: '/suporte/categoria/pagamento' },
  { label: 'Compras e entregas', route: '/suporte/categoria/entrega' },
  { label: 'Produto e garantia', route: '/suporte/categoria/produto' },
]

function goTo(route: string) {
  router.push(route)
}

function goBack() {
  router.back()
}
</script>

  <template>
  <div class="suporte">

    <!-- HEADER -->
    <div class="header">
      <img src="/suporte.png" />

      <!-- overlay escuro -->
      <div class="overlay"></div>

      <!-- botão voltar -->
      <button class="back-button" @click="goBack">
        <span class="material-symbols-outlined">arrow_back</span>
      </button>

      <h1>Como podemos<br>te ajudar?</h1>
    </div>

    <!-- CARD -->
    <div class="card">
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
    </div>

    <!-- BOTÕES -->
    <div class="bottom">
      <button class="ligue">
        <span class="material-symbols-outlined">call</span>
        Ligar
      </button>

      <button class="chat">
        <span class="material-symbols-outlined">chat</span>
        Chat
      </button>
    </div>

  </div>
</template>

<style scoped>
.suporte {
  min-height: 100vh;
  background: var(--surface-elevated);
  display: flex;
  flex-direction: column;
  font-family: "Montserrat", sans-serif;
}

/* HEADER */
.header {
  position: relative;
}

/* imagem */
.header img {
  width: 100%;
  height: 220px;
  object-fit: cover;
  display: block;
}

/* overlay (fica atrás dos botões) */
.overlay {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.25);
  z-index: 1;
}

/* botão voltar */
.back-button {
  position: absolute;
  top: 16px;
  left: 16px;
  z-index: 2;

  background: rgba(255,255,255,0.2);
  backdrop-filter: blur(6px);

  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;

  display: flex;
  align-items: center;
  justify-content: center;

  color: white;
  cursor: pointer;
}

/* título */
.header h1 {
  position: absolute;
  bottom: 24px;
  left: 16px;
  z-index: 2;
  color: white;
  font-size: 24px;
  font-weight: 600;
}

/* CARD */
.card {
  background: var(--surface-bg);
  margin-top: -30px;
  border-radius: 24px 24px 0 0;
  padding: 20px;
  box-shadow: 0 -4px 20px rgba(0,0,0,0.05);
}

.titulo {
  font-size: 14px;
  color: var(--text-muted);
  margin-bottom: 14px;
}

/* ITEM */
.item {
  display: flex;
  justify-content: space-between;
  align-items: center;

  padding: 16px 0;
  border-bottom: 1px solid #eee;
  cursor: pointer;

  transition: transform 0.15s ease,
              background 0.15s ease;
}

.item:active {
  transform: scale(0.97);
  background: var(--surface-elevated);
}

.arrow {
  color: #bbb;
}

/* BOTÕES */
.bottom {
  margin-top: auto;
  display: flex;
  gap: 12px;
  padding: 16px;
}

.ligue, .chat {
  flex: 1;
  border-radius: 30px;
  padding: 14px;

  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;

  font-weight: 500;
  cursor: pointer;

  transition: transform 0.15s ease, opacity 0.15s ease;
}

.ligue:active,
.chat:active {
  transform: scale(0.95);
  opacity: 0.85;
}

/* botão secundário */
.ligue {
  background: var(--surface-bg);
  border: 1px solid var(--border-color);
}

/* botão principal */
.chat {
  background: black;
  color: white;
}
</style>