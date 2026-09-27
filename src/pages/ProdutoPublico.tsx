import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { obterProdutoPublico, supabaseConfigurado } from '../services/produtos/ProdutosService'
import type { ProdutoPublico as ProdutoPublicoDados } from '../types/produto'

type Estado = 'carregando' | 'nao-encontrado' | 'nao-ativado' | 'ativado' | 'erro'

function ProdutoPublico() {
  const { sequencial } = useParams<{ sequencial: string }>()
  const [estado, setEstado] = useState<Estado>(supabaseConfigurado ? 'carregando' : 'erro')
  const [produto, setProduto] = useState<ProdutoPublicoDados | null>(null)

  useEffect(() => {
    if (!sequencial || !supabaseConfigurado) return

    obterProdutoPublico(sequencial)
      .then((dados) => {
        setProduto(dados)
        if (!dados.existe) setEstado('nao-encontrado')
        else if (!dados.ativo) setEstado('nao-ativado')
        else setEstado('ativado')
      })
      .catch(() => setEstado('erro'))
  }, [sequencial])

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-8">
      <div className="max-w-md w-full text-center">
        {estado === 'carregando' && <p className="text-gray-400">Carregando...</p>}

        {(estado === 'nao-encontrado' || estado === 'erro') && (
          <p className="text-gray-400">Código não encontrado.</p>
        )}

        {estado === 'nao-ativado' && (
          <p className="text-gray-400">Este código ainda não foi ativado.</p>
        )}

        {estado === 'ativado' && produto && (
          <div className="text-left">
            <h1 className="text-2xl font-bold text-blue-400 mb-2">{produto.nome}</h1>
            {produto.descricao && (
              <p className="text-gray-300 mb-4">{produto.descricao}</p>
            )}
            {produto.fotos && produto.fotos.length > 0 && (
              <div className="grid grid-cols-2 gap-2">
                {produto.fotos.map((url) => (
                  <img key={url} src={url} className="rounded-lg w-full h-32 object-cover" />
                ))}
              </div>
            )}
          </div>
        )}

        <p className="mt-6 text-xs text-gray-600 font-mono">{sequencial}</p>
      </div>
    </div>
  )
}

export default ProdutoPublico
