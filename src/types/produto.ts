export interface Produto {
  sequencial: string
  nome: string | null
  descricao: string | null
  fotos: string[]
  ativo: boolean
  createdAt: string
}

export interface ProdutoPublico {
  existe: boolean
  ativo: boolean
  nome: string | null
  descricao: string | null
  fotos: string[] | null
}
