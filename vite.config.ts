import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

export default defineConfig(({ mode }) => ({
  plugins: [
    vue(),

    VitePWA({
      registerType: 'autoUpdate',

      manifest: {
        id: 'com.reveste-pwa',
        name: 'ReVeste',
        short_name: 'ReVeste',
        description: 'Brechó Digital',
        theme_color: '#000000',
        background_color: '#ffffff',
        display: 'standalone',

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
        ],
      },
    }),
  ],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  // A chave fictícia só existe durante os testes.
  define:
    mode === 'test'
      ? {
          'import.meta.env.VITE_MERCADO_PAGO_PUBLIC_KEY': JSON.stringify('TEST-PUBLIC-KEY'),
        }
      : {},
  test: {
    include: ['src/**/*.spec.ts', 'tests/cart-auth.test.ts'],
    environment: 'jsdom',
  },
}))
