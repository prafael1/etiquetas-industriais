export type Orientacao = 'retrato' | 'paisagem'

export type TipoElemento = 'produto' | 'sequencial' | 'volume' | 'posicao' | 'qrcode'

export interface ElementoEtiqueta {
  tipo: TipoElemento
  x: number      // milímetros
  y: number      // milímetros
  largura: number
  altura: number
  fontSize?: number
  negrito?: boolean
}

export interface ConfigEtiqueta {
  largura: number       // milímetros
  altura: number        // milímetros
  margem: number        // milímetros
  orientacao: Orientacao
  dpi: number
  elementos: ElementoEtiqueta[]
}