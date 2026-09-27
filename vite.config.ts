import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// GitHub Pages serve este projeto em /etiquetas-industriais/ (páginas de
// repositório, não de usuário); outros hosts (Vercel, domínio próprio)
// servem na raiz. GITHUB_PAGES=true só é setado no workflow de deploy.
export default defineConfig({
  base: process.env.GITHUB_PAGES ? '/etiquetas-industriais/' : '/',
  plugins: [
    react(),
    tailwindcss(),
  ],
})