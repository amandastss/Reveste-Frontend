import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'

import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:8000/api'
})

export async function loginUser(data) {

  const response = await api.post('/token/', data)

  localStorage.setItem(
    'token',
    response.data.access
  )

  return response.data
}
const app = createApp(App)

app.use(router)
app.use(createPinia())

app.mount('#app')
