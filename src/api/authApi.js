import api from './config'

// login
export const loginRequest = (email, password) => {
  return api.post('/login/', {
    email,
    password
  })
}

// registro
export const registerRequest = (email, password) => {
  return api.post('/register/', {
    email,
    password
  })
}
