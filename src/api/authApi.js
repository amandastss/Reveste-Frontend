import axios from 'axios'

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api/'
})

export default {
  async login(email, password) {
    const response = await api.post('token/', {
      username: email, // ⚠️ aqui depende do seu backend
      password
    })

    localStorage.setItem('token', response.data.access)

    return response.data
  }
}
