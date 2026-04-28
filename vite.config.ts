import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { VitePWA } from "vite-plugin-pwa"

// https://vite.dev/config/
export default defineConfig({
  base: process.env.NODE_ENV === "production" ? "./" : "/",
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: "Fisherman's Quiz",
        short_name: "Feeesh",
        start_url: ".",
        display: "standalone",
        theme_color: "#14b8a6",
        background_color: "#14b8a6",
        icons: [
          { src: "pwa-192x192.png", sizes: "192x192", type: "image/png" },
          { src: "pwa-512x512.png", sizes: "512x512", type: "image/png" },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json}'],
      },
    }),
  ],
  server: {
    port: 3000,
    host: "0.0.0.0",
  },
  build: {
    cssMinify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
            return 'vendor-react'
          }
          if (id.includes('node_modules/@radix-ui')) {
            return 'vendor-radix'
          }
          if (id.includes('node_modules/recharts')) {
            return 'vendor-charts'
          }
          if (id.includes('node_modules/zod') || id.includes('node_modules/sonner') || id.includes('node_modules/vaul')) {
            return 'vendor-utils'
          }
        },
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
