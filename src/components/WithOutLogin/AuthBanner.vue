<template>
  <section class="banner">
    <div class="overlay">
      <h1 class="logo">ReVeste</h1>

      <div class="content">
        <h2>
          Para continuar,
          cadastre-se ou
          efetue seu login.
        </h2>

        <div class="buttons">
          <button @click="$emit('register')">
            CADASTRAR
          </button>

          <button @click="$emit('login')">
            LOGIN
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.banner {
  height: 55vh;
  background-image: url('@/public/bannerlogin.png');
  background-size: cover;
  background-position: center;
  position: relative;
}

.overlay {
  background: rgba(0,0,0,0.35);
  width: 100%;
  height: 100%;
  padding: 30px;
  color: white;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.logo {
  font-size: 3rem;
  font-weight: 300;
}

.content h2 {
  font-size: 2.2rem;
  line-height: 1.2;
}

.buttons {
  display: flex;
  gap: 15px;
  margin-top: 30px;
}

button {
  border: none;
  padding: 14px 30px;
  border-radius: 999px;
  font-weight: bold;
}
</style>
