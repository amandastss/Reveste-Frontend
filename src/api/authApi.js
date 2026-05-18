import api from './config'

// verificar se email existe
const checkEmail = (email) => {
  return api.post('/api/check-email/', { email })
}

// enviar email para verificação
const sendEmail = (email) => {
  return api.post('/api/send-email/', { email })
}

// login
const login = (email, password) => {
  return api.post('/api/login/', { email, password })
}

// registro
const register = (email, name, password, role = 'buyer') => {
  return api.post('/api/registro/', { email, name, password, role })
}

// verificar código
const verifyCode = (email, code) => {
  return api.post('/api/verify-code/', { email, code })
}

// solicitar reset de senha
const requestPasswordReset = (email) => {
  return api.post('/api/forgot-password/', { email })
}

// resetar senha
const resetPassword = (email, code, newPassword) => {
  return api.post('/api/reset-password/', { email, code, new_password: newPassword })
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
