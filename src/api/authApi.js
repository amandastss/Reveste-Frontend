import api from './config'

// verificar se email existe
const checkEmail = (email) => {
  return api.post('/check-email/', { email })
}

// enviar email para verificação
const sendEmail = (email) => {
  return api.post('/send-email/', { email })
}

// login
const login = (email, password) => {
  return api.post('/login/', { email, password })
}

// registro
const register = (email, password) => {
  return api.post('/register/', { email, password })
}

// verificar código
const verifyCode = (email, code) => {
  return api.post('/verify-code/', { email, code })
}

// solicitar reset de senha
const requestPasswordReset = (email) => {
  return api.post('/forgot-password/', { email })
}

// resetar senha
const resetPassword = (email, code, newPassword) => {
  return api.post('/reset-password/', { email, code, new_password: newPassword })
}

export default {
  checkEmail,
  sendEmail,
  login,
  register,
  verifyCode,
  requestPasswordReset,
  resetPassword
}
