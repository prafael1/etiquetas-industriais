import { useState } from 'react'
import { BrowserPrintAdapter } from '../services/impressao/BrowserPrintAdapter'
import { reservarProdutos, supabaseConfigurado } from '../services/produtos/ProdutosService'
import type { ConfigEtiqueta } from '../types/etiqueta'

interface Etiqueta {
  sequencial: string
  volume: string
  posicao: string
  nomeProduto: string
}

interface Props {
  config: ConfigEtiqueta
}

function gerarEtiquetas(sequenciais: string[], volumes: number, nomeProduto: string): Etiqueta[] {
  const resultado: Etiqueta[] = []

  for (const seq of sequenciais) {
    const base = { sequencial: seq, nomeProduto }

    if (volumes === 1) {
      resultado.push({ ...base, volume: '1/1', posicao: '' })
    }

    if (volumes === 2) {
      resultado.push({ ...base, volume: '1/2', posicao: 'E' })
      resultado.push({ ...base, volume: '2/2', posicao: 'D' })
    }

    if (volumes === 3) {
      resultado.push({ ...base, volume: '1/3', posicao: 'E' })
      resultado.push({ ...base, volume: '2/3', posicao: 'D' })
      resultado.push({ ...base, volume: '3/3', posicao: '' })
    }
  }

  return resultado
}

function GeradorEtiquetas({ config }: Props) {
  const [nomeProduto, setNomeProduto] = useState('')
  const [quantidade, setQuantidade] = useState(1)
  const [volumes, setVolumes] = useState(1)
  const [etiquetas, setEtiquetas] = useState<Etiqueta[]>([])
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  const nomeValido = nomeProduto.trim().length > 0

  async function handleGerar() {
    if (!nomeValido || carregando) return
    setCarregando(true)
    setErro(null)
    try {
      const sequenciais = await reservarProdutos(nomeProduto.trim(), quantidade)
      setEtiquetas(gerarEtiquetas(sequenciais, volumes, nomeProduto.trim()))
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro ao reservar sequenciais')
    } finally {
      setCarregando(false)
    }
  }

  async function handleImprimir() {
    if (etiquetas.length === 0) return
    const adapter = new BrowserPrintAdapter(config)
    await adapter.imprimir(etiquetas)
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-2xl font-bold text-blue-400 mb-6">
        Gerador de Etiquetas
      </h1>

      <div className="flex gap-8">

        {/* Painel de configuração */}
        <div className="bg-gray-800 rounded-lg p-6 w-64 flex flex-col gap-4">

          <div>
            <label className="block text-sm text-gray-400 mb-1">Nome do produto</label>
            <input
              type="text"
              value={nomeProduto}
              onChange={(e) => setNomeProduto(e.target.value)}
              placeholder="Ex: CAMA BAÚ CASAL"
              className="w-full bg-gray-700 rounded px-3 py-2 text-white placeholder-gray-500"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Quantidade de produtos</label>
            <input
              type="number"
              value={quantidade}
              onChange={(e) => setQuantidade(Number(e.target.value))}
              className="w-full bg-gray-700 rounded px-3 py-2 text-white"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Volumes por produto</label>
            <select
              value={volumes}
              onChange={(e) => setVolumes(Number(e.target.value))}
              className="w-full bg-gray-700 rounded px-3 py-2 text-white"
            >
              <option value={1}>1 volume</option>
              <option value={2}>2 volumes</option>
              <option value={3}>3 volumes</option>
            </select>
          </div>

          {!supabaseConfigurado && (
            <p className="bg-yellow-900 text-yellow-300 text-xs rounded px-3 py-2">
              Supabase não configurado. Defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.
            </p>
          )}

          {erro && <p className="text-red-400 text-sm">{erro}</p>}

          <button
            onClick={handleGerar}
            disabled={!nomeValido || carregando}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded transition-colors"
          >
            {carregando ? 'RESERVANDO...' : 'GERAR'}
          </button>

          <button
            onClick={handleImprimir}
            disabled={etiquetas.length === 0}
            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded transition-colors"
          >
            IMPRIMIR ({etiquetas.length})
          </button>

        </div>

        {/* Lista de etiquetas geradas */}
        <div className="flex-1">
          {etiquetas.length === 0 ? (
            <p className="text-gray-500">Nenhuma etiqueta gerada ainda.</p>
          ) : (
            <div className="flex flex-col gap-2">
              <p className="text-sm text-gray-400 mb-2">
                {etiquetas.length} etiqueta(s) gerada(s)
              </p>
              {etiquetas.map((et, index) => (
                <div key={index} className="bg-gray-800 rounded px-4 py-2 font-mono text-sm flex gap-4">
                  <span className="text-blue-400">{et.sequencial}</span>
                  <span className="text-white">{et.volume}</span>
                  <span className="text-yellow-400 w-4">{et.posicao}</span>
                  <span className="text-gray-400 truncate">{et.nomeProduto}</span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}

export default GeradorEtiquetas