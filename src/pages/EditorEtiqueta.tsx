import { useState } from 'react'
import PreviewEtiqueta from '../modules/etiquetas/PreviewEtiqueta'
import type { ConfigEtiqueta, ElementoEtiqueta } from '../types/etiqueta'

interface Props {
  config: ConfigEtiqueta
  onConfigChange: (config: ConfigEtiqueta) => void
}

function EditorEtiqueta({ config, onConfigChange }: Props) {
  const [elementoSelecionado, setElementoSelecionado] = useState<string | null>(null)

  const elAtivo = config.elementos.find(e => e.tipo === elementoSelecionado)

  function alterarElemento(patch: Partial<ElementoEtiqueta>) {
    const novosElementos = config.elementos.map(el =>
      el.tipo === elementoSelecionado ? { ...el, ...patch } : el
    )
    onConfigChange({ ...config, elementos: novosElementos })
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-2xl font-bold text-blue-400 mb-6">
        Editor de Etiqueta
      </h1>

      <div className="flex gap-8">

        {/* Painel esquerdo - configurações */}
        <div className="bg-gray-800 rounded-lg p-6 w-64 flex flex-col gap-4">
          <h2 className="text-lg font-semibold">Configurações</h2>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Largura (mm)</label>
            <input
              type="number"
              value={config.largura}
              onChange={(e) => onConfigChange({ ...config, largura: Number(e.target.value) })}
              className="w-full bg-gray-700 rounded px-3 py-2 text-white"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Altura (mm)</label>
            <input
              type="number"
              value={config.altura}
              onChange={(e) => onConfigChange({ ...config, altura: Number(e.target.value) })}
              className="w-full bg-gray-700 rounded px-3 py-2 text-white"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Orientação</label>
            <select
              value={config.orientacao}
              onChange={(e) => {
                const novaOrientacao = e.target.value as 'retrato' | 'paisagem'
                const deveGirar = novaOrientacao !== config.orientacao
                onConfigChange({
                  ...config,
                  orientacao: novaOrientacao,
                  largura: deveGirar ? config.altura : config.largura,
                  altura: deveGirar ? config.largura : config.altura,
                })
              }}
              className="w-full bg-gray-700 rounded px-3 py-2 text-white"
            >
              <option value="retrato">Retrato</option>
              <option value="paisagem">Paisagem</option>
            </select>
          </div>

          {/* Painel de propriedades do elemento selecionado */}
          {elAtivo && (
            <div className="border-t border-gray-600 pt-4 flex flex-col gap-3">
              <h3 className="text-sm font-semibold text-blue-400">
                Editando: {elementoSelecionado?.toUpperCase()}
              </h3>

              {elAtivo.tipo === 'qrcode' ? (
                <div>
                  <label className="block text-sm text-gray-400 mb-1">
                    Tamanho do QR Code (mm)
                  </label>
                  <input
                    type="number"
                    value={elAtivo.largura}
                    onChange={(e) => {
                      const lado = Number(e.target.value)
                      alterarElemento({ largura: lado, altura: lado })
                    }}
                    className="w-full bg-gray-700 rounded px-3 py-2 text-white"
                  />
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Tamanho da fonte</label>
                    <input
                      type="number"
                      value={elAtivo.fontSize ?? 14}
                      onChange={(e) => alterarElemento({ fontSize: Number(e.target.value) })}
                      className="w-full bg-gray-700 rounded px-3 py-2 text-white"
                    />
                  </div>

                  <button
                    onClick={() => alterarElemento({ negrito: !elAtivo.negrito })}
                    className={`px-4 py-2 rounded text-sm font-bold transition-colors ${
                      elAtivo.negrito
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-600 text-gray-300'
                    }`}
                  >
                    {elAtivo.negrito ? 'Negrito ✓' : 'Negrito'}
                  </button>

                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="block text-sm text-gray-400 mb-1">Larg. (mm)</label>
                      <input
                        type="number"
                        value={elAtivo.largura}
                        onChange={(e) => alterarElemento({ largura: Number(e.target.value) })}
                        className="w-full bg-gray-700 rounded px-3 py-2 text-white"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm text-gray-400 mb-1">Alt. (mm)</label>
                      <input
                        type="number"
                        value={elAtivo.altura}
                        onChange={(e) => alterarElemento({ altura: Number(e.target.value) })}
                        className="w-full bg-gray-700 rounded px-3 py-2 text-white"
                      />
                    </div>
                  </div>
                </>
              )}

              <p className="text-xs text-gray-500">
                Arraste o quadrado azul no canto do elemento para redimensionar.
              </p>
            </div>
          )}
        </div>

        {/* Área central - preview da etiqueta */}
        <div className="flex-1 flex flex-col items-center">
          <h2 className="text-lg font-semibold mb-4">Preview</h2>
          <div className="bg-gray-700 p-6 rounded-lg">
            <PreviewEtiqueta
              config={config}
              onConfigChange={onConfigChange}
              elementoSelecionado={elementoSelecionado}
              onSelecionarElemento={setElementoSelecionado}
              nomeProduto="PRODUTO EXEMPLO"
              sequencial="000001"
              volume="1/2"
              posicao="E"
            />
          </div>
          {elementoSelecionado && (
            <p className="mt-2 text-xs text-gray-500">
              Clique em outro lugar para desselecionar
            </p>
          )}
        </div>

      </div>
    </div>
  )
}

export default EditorEtiqueta