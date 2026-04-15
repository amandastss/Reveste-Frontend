import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),

    VitePWA({
      registerType: 'autoUpdate',

      manifest: {
        id: 'com.brecho.app',
        name: 'Brechó Online',
        short_name: 'Brechó',
        description: 'Compre e venda roupas e acessórios de segunda mão',

        theme_color: '#111111',          // preto elegante
        background_color: '#f6f6f6',     // mesmo fundo do teu layout

        display: 'standalone',
        scope: '/',
        start_url: '/auth/email',

        icons: [
          {
            src: '/icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: '/icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          }
        ]
      },

      devOptions: {
        enabled: true
      }
    })
  ],

  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
