import { useState } from 'react'
import {
  buscarProdutoAdmin,
  atualizarProduto,
  ativarProduto,
  uploadFoto,
  supabaseConfigurado,
} from '../services/produtos/ProdutosService'
import type { Produto } from '../types/produto'

function CadastroProdutos() {
  const [sequencialBusca, setSequencialBusca] = useState('')
  const [produto, setProduto] = useState<Produto | null>(null)
  const [naoEncontrado, setNaoEncontrado] = useState(false)
  const [carregando, setCarregando] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  const [nome, setNome] = useState('')
  const [descricao, setDescricao] = useState('')
  const [fotos, setFotos] = useState<string[]>([])

  async function handleBuscar() {
    if (!sequencialBusca.trim()) return
    setCarregando(true)
    setErro(null)
    setNaoEncontrado(false)
    try {
      const encontrado = await buscarProdutoAdmin(sequencialBusca.trim())
      if (!encontrado) {
        setProduto(null)
        setNaoEncontrado(true)
      } else {
        setProduto(encontrado)
        setNome(encontrado.nome ?? '')
        setDescricao(encontrado.descricao ?? '')
        setFotos(encontrado.fotos)
      }
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro ao buscar produto')
    } finally {
      setCarregando(false)
    }
  }

  async function handleUploadFotos(arquivos: FileList | null) {
    if (!arquivos || !produto) return
    setSalvando(true)
    setErro(null)
    try {
      const urls = await Promise.all(
        Array.from(arquivos).map((arquivo) => uploadFoto(produto.sequencial, arquivo))
      )
      setFotos((atual) => [...atual, ...urls])
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro ao enviar foto')
    } finally {
      setSalvando(false)
    }
  }

  function handleRemoverFoto(url: string) {
    setFotos((atual) => atual.filter((f) => f !== url))
  }

  async function handleSalvar() {
    if (!produto) return
    setSalvando(true)
    setErro(null)
    try {
      await atualizarProduto(produto.sequencial, nome, descricao, fotos)
      setProduto({ ...produto, nome, descricao, fotos })
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro ao salvar produto')
    } finally {
      setSalvando(false)
    }
  }

  async function handleAtivar() {
    if (!produto) return
    setSalvando(true)
    setErro(null)
    try {
      await ativarProduto(produto.sequencial)
      setProduto({ ...produto, ativo: true })
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro ao ativar produto')
    } finally {
      setSalvando(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-2xl font-bold text-blue-400 mb-6">Cadastro de Produtos</h1>

      {!supabaseConfigurado && (
        <p className="bg-yellow-900 text-yellow-300 text-sm rounded px-4 py-2 mb-6 max-w-xl">
          Supabase não configurado. Defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY para usar
          esta tela.
        </p>
      )}

      <div className="flex gap-2 mb-6 max-w-xl">
        <input
          type="text"
          value={sequencialBusca}
          onChange={(e) => setSequencialBusca(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleBuscar()}
          placeholder="Sequencial (ex: 000001)"
          className="flex-1 bg-gray-700 rounded px-3 py-2 text-white font-mono"
        />
        <button
          onClick={handleBuscar}
          disabled={carregando}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-bold px-4 py-2 rounded"
        >
          Buscar
        </button>
      </div>

      {naoEncontrado && <p className="text-gray-400">Nenhum produto com esse sequencial.</p>}
      {erro && <p className="text-red-400 mb-4">{erro}</p>}

      {produto && (
        <div className="bg-gray-800 rounded-lg p-6 max-w-xl flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <span className="font-mono text-blue-400">{produto.sequencial}</span>
            <span
              className={`text-xs font-bold px-2 py-1 rounded ${
                produto.ativo ? 'bg-green-700 text-green-200' : 'bg-gray-600 text-gray-300'
              }`}
            >
              {produto.ativo ? 'ATIVADO' : 'NÃO ATIVADO'}
            </span>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Nome do produto</label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-full bg-gray-700 rounded px-3 py-2 text-white"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Descrição</label>
            <textarea
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              rows={3}
              className="w-full bg-gray-700 rounded px-3 py-2 text-white"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Fotos</label>
            {fotos.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mb-2">
                {fotos.map((url) => (
                  <div key={url} className="relative">
                    <img src={url} className="rounded w-full h-20 object-cover" />
                    <button
                      onClick={() => handleRemoverFoto(url)}
                      className="absolute top-1 right-1 bg-red-600 text-white text-xs rounded px-1"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => handleUploadFotos(e.target.files)}
              className="text-sm text-gray-400"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              onClick={handleSalvar}
              disabled={salvando}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-bold px-4 py-2 rounded"
            >
              Salvar
            </button>
            <button
              onClick={handleAtivar}
              disabled={salvando || produto.ativo}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold px-4 py-2 rounded"
            >
              {produto.ativo ? 'Já ativado' : 'Ativar'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default CadastroProdutos
