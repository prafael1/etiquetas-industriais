import { useState, useEffect } from 'react'
import EditorEtiqueta from './pages/EditorEtiqueta'
import GeradorEtiquetas from './pages/GeradorEtiquetas'
import CadastroProdutos from './pages/CadastroProdutos'
import { configPadrao } from './modules/etiquetas/configPadrao'
import type { ConfigEtiqueta } from './types/etiqueta'

type Pagina = 'editor' | 'gerador' | 'cadastro'

const CHAVE_STORAGE = 'etiquetas-config'

function carregarConfig(): ConfigEtiqueta {
  try {
    const salvo = localStorage.getItem(CHAVE_STORAGE)
    if (salvo) return JSON.parse(salvo)
  } catch {
    // se falhar, usa o padrão
  }
  return configPadrao
}

function App() {
  const [pagina, setPagina] = useState<Pagina>('editor')
  const [config, setConfig] = useState<ConfigEtiqueta>(carregarConfig)

  useEffect(() => {
    localStorage.setItem(CHAVE_STORAGE, JSON.stringify(config))
  }, [config])

  return (
    <div>
      <nav className="bg-gray-950 border-b border-gray-700 px-8 py-3 flex gap-4">
        <button
          onClick={() => setPagina('editor')}
          className={`px-4 py-2 rounded text-sm font-semibold transition-colors ${
            pagina === 'editor'
              ? 'bg-blue-600 text-white'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Editor de Etiqueta
        </button>
        <button
          onClick={() => setPagina('gerador')}
          className={`px-4 py-2 rounded text-sm font-semibold transition-colors ${
            pagina === 'gerador'
              ? 'bg-blue-600 text-white'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Gerador de Etiquetas
        </button>
        <button
          onClick={() => setPagina('cadastro')}
          className={`px-4 py-2 rounded text-sm font-semibold transition-colors ${
            pagina === 'cadastro'
              ? 'bg-blue-600 text-white'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Cadastro de Produtos
        </button>
      </nav>

      {pagina === 'editor' && (
        <EditorEtiqueta config={config} onConfigChange={setConfig} />
      )}
      {pagina === 'gerador' && (
        <GeradorEtiquetas config={config} />
      )}
      {pagina === 'cadastro' && <CadastroProdutos />}
    </div>
  )
}

export default App