import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App'
import ProdutoPublico from './pages/ProdutoPublico'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/q/:sequencial" element={<ProdutoPublico />} />
      </Routes>
    </HashRouter>
  </StrictMode>,
)
