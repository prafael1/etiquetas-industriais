export interface DadosEtiqueta {
  sequencial: string
  volume: string
  posicao: string
  nomeProduto: string
}

export interface ImpressoraAdapter {
  imprimir(etiquetas: DadosEtiqueta[]): Promise<void>
}