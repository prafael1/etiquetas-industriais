import type { ConfigEtiqueta } from '../../types/etiqueta'
import { QRCodeSVG } from 'qrcode.react'
import { DndContext } from '@dnd-kit/core'
import type { DragEndEvent } from '@dnd-kit/core'
import ElementoArrastavel from './ElementoArrastavel'
import { urlProduto } from '../../utils/urlProduto'

interface Props {
  config: ConfigEtiqueta
  onConfigChange: (config: ConfigEtiqueta) => void
  elementoSelecionado: string | null
  onSelecionarElemento: (tipo: string | null) => void
  nomeProduto?: string
  sequencial?: string
  volume?: string
  posicao?: string
}

const MM_PARA_PX = 3.78

// tamanhos mínimos em mm, para o elemento não desaparecer ao redimensionar
const MIN_TEXTO = 3
const MIN_QRCODE = 8

function mmParaPx(mm: number) {
  return mm * MM_PARA_PX
}

function pxParaMm(px: number) {
  return px / MM_PARA_PX
}

// evita guardar 40.211640211640214 mm no config
function arredondar(mm: number) {
  return Math.round(mm * 10) / 10
}

function PreviewEtiqueta({
  config,
  onConfigChange,
  elementoSelecionado,
  onSelecionarElemento,
  nomeProduto,
  sequencial,
  volume,
  posicao,
}: Props) {
  const larguraPx = mmParaPx(config.largura)
  const alturaPx = mmParaPx(config.altura)

  function handleDragEnd(event: DragEndEvent) {
    const { active, delta } = event
    const id = active.id as string

    const novosElementos = config.elementos.map((el) => {
      if (el.tipo === id) {
        return {
          ...el,
          x: arredondar(Math.max(0, el.x + pxParaMm(delta.x))),
          y: arredondar(Math.max(0, el.y + pxParaMm(delta.y))),
        }
      }
      return el
    })

    onConfigChange({ ...config, elementos: novosElementos })
  }

  function handleRedimensionar(tipo: string, larguraPx: number, alturaPx: number) {
    const novosElementos = config.elementos.map((el) => {
      if (el.tipo !== tipo) return el

      // o QR Code é sempre quadrado: a largura manda
      if (el.tipo === 'qrcode') {
        const lado = arredondar(Math.max(MIN_QRCODE, pxParaMm(larguraPx)))
        return { ...el, largura: lado, altura: lado }
      }

      return {
        ...el,
        largura: arredondar(Math.max(MIN_TEXTO, pxParaMm(larguraPx))),
        altura: arredondar(Math.max(MIN_TEXTO, pxParaMm(alturaPx))),
      }
    })

    onConfigChange({ ...config, elementos: novosElementos })
  }

  function renderConteudo(tipo: string) {
    const el = config.elementos.find(e => e.tipo === tipo)
    const fs = el?.fontSize ?? 14
    const fw = el?.negrito ? 'bold' : 'normal'

    if (tipo === 'produto') {
      return (
        <span style={{ fontFamily: 'monospace', color: 'black', fontSize: fs, fontWeight: fw }}>
          {nomeProduto ?? 'NOME DO PRODUTO'}
        </span>
      )
    }

    if (tipo === 'sequencial') {
      return (
        <span style={{ fontFamily: 'monospace', color: 'black', fontSize: fs, fontWeight: fw }}>
          {sequencial ?? '000001'}
        </span>
      )
    }

    if (tipo === 'volume') {
      return (
        <span style={{ fontFamily: 'monospace', color: 'black', fontSize: fs, fontWeight: fw }}>
          {volume ?? '1/1'}
        </span>
      )
    }

    if (tipo === 'posicao') {
      return (
        <span style={{ fontFamily: 'monospace', color: 'black', fontSize: fs, fontWeight: fw }}>
          {posicao ?? ''}
        </span>
      )
    }

    if (tipo === 'qrcode') {
      const el = config.elementos.find(e => e.tipo === 'qrcode')
      const size = el ? mmParaPx(el.largura) : 80
      return <QRCodeSVG value={urlProduto(sequencial ?? '000001')} size={size} level="M" />
    }

    return null
  }

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div
        onClick={() => onSelecionarElemento(null)}
        style={{
          position: 'relative',
          width: larguraPx,
          height: alturaPx,
          background: 'white',
          border: '1px solid #555',
          overflow: 'hidden',
        }}
      >
        {config.elementos.map((el) => (
          <ElementoArrastavel
            key={el.tipo}
            id={el.tipo}
            x={mmParaPx(el.x)}
            y={mmParaPx(el.y)}
            largura={mmParaPx(el.largura)}
            altura={mmParaPx(el.altura)}
            selecionado={elementoSelecionado === el.tipo}
            onSelecionar={() => onSelecionarElemento(el.tipo)}
            onRedimensionar={(larguraPx, alturaPx) =>
              handleRedimensionar(el.tipo, larguraPx, alturaPx)
            }
          >
            {renderConteudo(el.tipo)}
          </ElementoArrastavel>
        ))}
      </div>
    </DndContext>
  )
}

export default PreviewEtiqueta
