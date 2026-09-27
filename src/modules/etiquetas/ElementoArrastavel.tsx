import { useRef } from 'react'
import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'

interface Props {
  id: string
  x: number
  y: number
  largura: number
  altura: number
  selecionado: boolean
  onSelecionar: () => void
  onRedimensionar: (larguraPx: number, alturaPx: number) => void
  children: React.ReactNode
}

function ElementoArrastavel({
  id,
  x,
  y,
  largura,
  altura,
  selecionado,
  onSelecionar,
  onRedimensionar,
  children,
}: Props) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id })

  // guarda o tamanho e o ponteiro no início do arrasto da alça, para que
  // cada movimento reporte o tamanho absoluto (e não um incremento sobre
  // um config possivelmente desatualizado pelo closure)
  const inicio = useRef<{ largura: number; altura: number; x: number; y: number } | null>(null)

  function iniciarRedimensionamento(e: React.PointerEvent) {
    e.stopPropagation()
    e.preventDefault()
    inicio.current = { largura, altura, x: e.clientX, y: e.clientY }

    function mover(ev: PointerEvent) {
      const ref = inicio.current
      if (!ref) return
      onRedimensionar(
        ref.largura + (ev.clientX - ref.x),
        ref.altura + (ev.clientY - ref.y)
      )
    }

    function soltar() {
      inicio.current = null
      window.removeEventListener('pointermove', mover)
      window.removeEventListener('pointerup', soltar)
    }

    window.addEventListener('pointermove', mover)
    window.addEventListener('pointerup', soltar)
  }

  const style = {
    position: 'absolute' as const,
    left: x,
    top: y,
    transform: CSS.Translate.toString(transform),
    cursor: selecionado ? 'grab' : 'pointer',
    outline: selecionado ? '2px dashed #3b82f6' : '2px dashed transparent',
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onPointerDown={(e) => {
        e.stopPropagation()
        onSelecionar()
        listeners?.onPointerDown?.(e)
      }}
    >
      <div style={{ width: largura, height: altura, overflow: 'hidden' }}>
        {children}
      </div>

      {selecionado && (
        <div
          onPointerDown={iniciarRedimensionamento}
          style={{
            position: 'absolute',
            right: -5,
            bottom: -5,
            width: 10,
            height: 10,
            background: '#3b82f6',
            border: '1px solid white',
            borderRadius: 2,
            cursor: 'nwse-resize',
            touchAction: 'none',
          }}
        />
      )}
    </div>
  )
}

export default ElementoArrastavel
