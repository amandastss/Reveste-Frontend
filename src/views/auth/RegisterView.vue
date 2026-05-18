<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import authApi from '../../api/authApi'

const router = useRouter()
const name = ref('')
const email = ref(localStorage.getItem('email') || '')
const password = ref('')
const birthdate = ref('')
const phone = ref('')
const photo = ref('')
const photoPreview = ref('')

function handlePhotoChange(event) {
  const file = event.target.files?.[0]
  if (!file) {
    photo.value = ''
    photoPreview.value = ''
    return
  }

  const reader = new FileReader()
  reader.onload = () => {
    photo.value = reader.result || ''
    photoPreview.value = reader.result || ''
  }
  reader.readAsDataURL(file)
}

async function register() {
  if (!name.value || !email.value || !password.value || !birthdate.value || !phone.value) {
    alert('Preencha todos os campos')
    return
  }

  try {
    const response = await authApi.register(email.value, name.value, password.value)
    const userData = {
      ...response.data,
      name: name.value,
      email: email.value,
      phone: phone.value,
      photo: photo.value,
      date_of_birth: birthdate.value,
    }

    if (response?.data?.token) {
      localStorage.setItem('user', JSON.stringify(userData))
      localStorage.setItem('token', response.data.token)
      localStorage.setItem('isLogin', 'true')
      router.push('/')
      return
    }

    localStorage.setItem('user', JSON.stringify(userData))
    localStorage.setItem('isLogin', 'true')
    alert('Conta criada com sucesso! Agora faça login.')
    router.push('/auth/password')
  } catch (err) {
    console.error('Register error:', err)
    alert('Erro ao criar conta: ' + (err.response?.data?.message || 'Tente novamente'))
  }
}
</script>

<template>
  <div class="register">
    <h1>Criar conta</h1>
    <input v-model="name" placeholder="Nome completo" />
    <input v-model="email" placeholder="Email" type="email" />

    <div class="field-row">
      <div class="field-group">
        <label>Telefone</label>
        <input v-model="phone" placeholder="(xx) xxxxx-xxxx" type="tel" />
      </div>
      <div class="field-group">
        <label>Data de nascimento</label>
        <input v-model="birthdate" type="date" />
      </div>
    </div>

    <div class="photo-field">
      <label>Foto de perfil</label>
      <input type="file" accept="image/*" @change="handlePhotoChange" />
      <div v-if="photoPreview" class="photo-preview">
        <img :src="photoPreview" alt="Foto de perfil" />
      </div>
    </div>

    <input v-model="password" placeholder="Senha" type="password" />
    <button @click="register">Registrar</button>
  </div>
</template>

<style scoped>
.register {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

input {
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
}

button {
  padding: 10px;
  background: #000;
  color: #fff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.field-row {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
}

.field-group label {
  font-size: 12px;
  color: #555;
}

.field-group select,
.field-group input {
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
}

.photo-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}

.photo-preview {
  width: 110px;
  height: 110px;
  border-radius: 22px;
  overflow: hidden;
  border: 1px solid #ccc;
}

.photo-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.field-row {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
}

.field-group label {
  font-size: 12px;
  color: #555;
}

.field-group select,
.field-group input {
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
}
</style>
