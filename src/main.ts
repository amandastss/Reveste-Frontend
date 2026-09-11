import { createApp } from 'vue'
import App from './App.vue'
import { createPinia } from 'pinia'
import router from './router'

import './assets/theme.css'

import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faEnvelope } from '@fortawesome/free-regular-svg-icons'
import { faFacebookF, faGoogle, faApple } from '@fortawesome/free-brands-svg-icons'

library.add(faEnvelope, faFacebookF, faGoogle, faApple)

const savedTheme = localStorage.getItem('app-theme')
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
const initialTheme = savedTheme === 'light' || savedTheme === 'dark'
  ? savedTheme
  : prefersDark
    ? 'dark'
    : 'light'

document.documentElement.setAttribute('data-theme', initialTheme)

const app = createApp(App)

app.component('font-awesome-icon', FontAwesomeIcon)

app.use(createPinia())
app.use(router)

app.mount('#app')
