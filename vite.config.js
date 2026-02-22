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
      includeAssets: ['icons/icone192.png', 'icons/iconepwa.jpg'],
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
            src: '/icons/iconepwa.jpg',
            sizes: '192x192',
            type: 'image/jpeg',
          },
          {
            src: '/icons/iconepwa.jpg',
            sizes: '512x512',
            type: 'image/jpeg',
          },
          {
            src: '/icons/iconepwa.jpg',
            sizes: '512x512',
            type: 'image/jpeg',
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
