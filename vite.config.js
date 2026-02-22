import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/icone192.png', 'icons/icone512.png'],
      manifest: {
        name: 'ClicStudio',
        short_name: 'ClicStudio',
        description: 'Sistema de Gestão de Agenda - Estúdio de Fotografia',
        theme_color: '#5d109c',
        background_color: '#030712',
        display: 'standalone',
        orientation: 'any',
        start_url: '/',
        icons: [
          {
            src: '/icons/icone512.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/icons/icone512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: '/icons/icone512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
      },
    }),
  ],
})
