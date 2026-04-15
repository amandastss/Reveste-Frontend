const API_URL = 'http://localhost:3000' // ajusta pro teu backend

async function sendEmail(email) {
  const res = await fetch(`${API_URL}/auth/email`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email })
  })

  return res.json()
}

async function login(email, password) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, password })
  })

  return res.json()
}

export default {
  sendEmail,
  login
}
