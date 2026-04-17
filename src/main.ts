import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

// FONT AWESOME
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faFacebookF, faGoogle, faApple } from '@fortawesome/free-brands-svg-icons'

// adiciona ícones na lib
library.add(faFacebookF, faGoogle, faApple)

const app = createApp(App)

// registra global
app.component('font-awesome-icon', FontAwesomeIcon)

app.use(router)
app.mount('#app')
