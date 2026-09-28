import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  obterProdutoPublico,
  supabaseConfigurado,
} from '../services/produtos/ProdutosService'
import type { ProdutoPublico as ProdutoPublicoDados } from '../types/produto'

type Estado =
  | 'carregando'
  | 'nao-encontrado'
  | 'nao-ativado'
  | 'ativado'
  | 'erro'

// Ajuste aqui com as cores reais copiadas do site (DevTools)
const cores = {
  topbarBg: '#000000',
  topbarTexto: '#ffffff',
  fundo: '#ffffff',
  fundoAlto: '#3993f4',
  texto: '#1a1a1a',
  textoSuave: '#6b7280',
  borda: '#e5e5e5',
  acao: '#000000',
  acaoTexto: '#ffffff',
  rodapeBg: '#111111',
  rodapeTexto: '#d1d5db',
}

const LOGO_URL =
  'https://taace8.vtexassets.com/assets/vtex.file-manager-graphql/images/16c0fcc2-0100-433b-8b95-93904b13c4bc___0d1e44836a3304030b3eee09981f9c63.svg'

function ProdutoPublico() {
  const { sequencial } = useParams<{ sequencial: string }>()

  const [estado, setEstado] = useState<Estado>(
    supabaseConfigurado ? 'carregando' : 'erro'
  )

  const [produto, setProduto] = useState<ProdutoPublicoDados | null>(null)
  const [fotoAtiva, setFotoAtiva] = useState<string | null>(null)

  // Controle do zoom
  const [zoom, setZoom] = useState(false)

  const [posicaoZoom, setPosicaoZoom] = useState({
    x: 50,
    y: 50,
  })

  // Modal da imagem no celular / clique
  const [imagemAmpliada, setImagemAmpliada] = useState(false)

  useEffect(() => {
    if (!sequencial || !supabaseConfigurado) return

    obterProdutoPublico(sequencial)
      .then((dados) => {
        setProduto(dados)
        setFotoAtiva(dados.fotos?.[0] ?? null)

        if (!dados.existe) {
          setEstado('nao-encontrado')
        } else if (!dados.ativo) {
          setEstado('nao-ativado')
        } else {
          setEstado('ativado')
        }
      })
      .catch(() => setEstado('erro'))
  }, [sequencial])

  // Controla a posição do zoom conforme o mouse
  const handleMouseMove = (
    e: React.MouseEvent<HTMLDivElement>
  ) => {
    const rect = e.currentTarget.getBoundingClientRect()

    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100

    setPosicaoZoom({
      x,
      y,
    })
  }

  // Abre a imagem em tela maior
  const abrirImagemAmpliada = () => {
    if (!fotoAtiva) return

    setImagemAmpliada(true)
  }

  // Fecha a imagem ampliada
  const fecharImagemAmpliada = () => {
    setImagemAmpliada(false)
  }

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        backgroundColor: cores.fundo,
        color: cores.texto,
      }}
    >
      {/* Barra superior */}
      <div
        className="text-center text-sm py-2 px-4"
        style={{
          backgroundColor: cores.topbarBg,
          color: cores.topbarTexto,
        }}
      >
        <span className="font-bold">
          Garantia e qualidade
        </span>{' '}
        em cada produto
      </div>

      {/* Header */}
      <header
        className="border-b"
        style={{
          borderColor: cores.fundoAlto,
          backgroundColor: cores.fundoAlto,
        }}
      >
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <img
            src={LOGO_URL}
            alt="Probel"
            className="h-10"
          />
        </div>
      </header>

      {/* Conteúdo */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8">
        {/* Carregando */}
        {estado === 'carregando' && (
          <p
            className="text-center"
            style={{
              color: cores.textoSuave,
            }}
          >
            Carregando...
          </p>
        )}

        {/* Não encontrado / erro */}
        {(estado === 'nao-encontrado' ||
          estado === 'erro') && (
          <p
            className="text-center py-16"
            style={{
              color: cores.textoSuave,
            }}
          >
            Código não encontrado.
          </p>
        )}

        {/* Não ativado */}
        {estado === 'nao-ativado' && (
          <p
            className="text-center py-16"
            style={{
              color: cores.textoSuave,
            }}
          >
            Este código ainda não foi ativado.
          </p>
        )}

        {/* Produto */}
        {estado === 'ativado' && produto && (
          <div className="grid md:grid-cols-2 gap-8">
            {/* ========================= */}
            {/* GALERIA */}
            {/* ========================= */}
            <div>
              {fotoAtiva && (
                <div
                  className="border rounded-lg overflow-hidden bg-white relative"
                  style={{
                    borderColor: cores.borda,
                    height: '500px',
                  }}
                  onMouseEnter={() => setZoom(true)}
                  onMouseLeave={() => {
                    setZoom(false)

                    setPosicaoZoom({
                      x: 50,
                      y: 50,
                    })
                  }}
                  onMouseMove={handleMouseMove}
                  onClick={abrirImagemAmpliada}
                >
                  {/* Imagem */}
                  <img
                    src={fotoAtiva}
                    className="w-full h-full object-contain transition-transform duration-200"
                    style={{
                      transform: zoom
                        ? 'scale(2)'
                        : 'scale(1)',
                      transformOrigin: `${posicaoZoom.x}% ${posicaoZoom.y}%`,
                    }}
                  />

                  {/* Indicador de zoom */}
                  {!zoom && (
                    <div
                      className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-3 py-2 rounded"
                      style={{
                        pointerEvents: 'none',
                      }}
                    >
                      🔍 Passe o mouse para ampliar
                    </div>
                  )}
                </div>
              )}

              {/* Miniaturas */}
              {produto.fotos &&
                produto.fotos.length > 1 && (
                  <div className="grid grid-cols-4 gap-2 mt-3">
                    {produto.fotos.map((url) => (
                      <button
                        key={url}
                        type="button"
                        onClick={() => {
                          setFotoAtiva(url)
                          setZoom(false)
                        }}
                        className="border rounded-lg overflow-hidden bg-white"
                        style={{
                          borderColor:
                            url === fotoAtiva
                              ? cores.acao
                              : cores.borda,
                          borderWidth:
                            url === fotoAtiva ? 2 : 1,
                        }}
                      >
                        <img
                          src={url}
                          alt=""
                          className="w-full h-20 object-contain"
                        />
                      </button>
                    ))}
                  </div>
                )}
            </div>

            {/* ========================= */}
            {/* INFORMAÇÕES */}
            {/* ========================= */}
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-3">
                {produto.nome}
              </h1>

              {produto.descricao && (
                <p
                  className="leading-relaxed mb-6"
                  style={{
                    color: cores.textoSuave,
                  }}
                >
                  {produto.descricao}
                </p>
              )}

              <div
                className="inline-block rounded px-3 py-1 text-xs font-mono border"
                style={{
                  borderColor: cores.borda,
                  color: cores.textoSuave,
                }}
              >
                Código: {sequencial}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Rodapé */}
      <footer
        className="text-center text-xs py-6 px-4"
        style={{
          backgroundColor: cores.rodapeBg,
          color: cores.rodapeTexto,
        }}
      >
        Fotos meramente ilustrativas. Todos os direitos reservados.
      </footer>

      {/* ========================= */}
      {/* MODAL DA IMAGEM AMPLIADA */}
      {/* ========================= */}
      {imagemAmpliada && fotoAtiva && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={fecharImagemAmpliada}
        >
          {/* Botão fechar */}
          <button
            type="button"
            onClick={fecharImagemAmpliada}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 text-white text-2xl flex items-center justify-center"
            aria-label="Fechar imagem"
          >
            ×
          </button>

          {/* Imagem ampliada */}
          <div
            className="max-w-6xl max-h-[90vh] w-full h-full flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={fotoAtiva}
              alt={produto?.nome ?? 'Produto'}
              className="max-w-full max-h-full object-contain"
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default ProdutoPublico
