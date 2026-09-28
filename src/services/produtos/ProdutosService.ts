import { supabase, supabaseConfigurado } from '../supabase/client'
import type { Produto, ProdutoPublico } from '../../types/produto'

const BUCKET_FOTOS = 'fotos-produtos'

function exigirSupabase() {
  if (!supabase) {
    throw new Error(
      'Supabase não configurado. Defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.'
    )
  }

  return supabase
}

export async function reservarProdutos(
  nome: string,
  quantidade: number
): Promise<string[]> {
  const client = exigirSupabase()

  const { data, error } = await client.rpc('reservar_produtos', {
    p_nome: nome,
    p_quantidade: quantidade,
  })

  if (error) throw error

  return (data ?? []) as string[]
}

export async function buscarProdutoAdmin(
  sequencial: string
): Promise<Produto | null> {
  const client = exigirSupabase()

  const { data, error } = await client.rpc('buscar_produto_admin', {
    p_sequencial: sequencial,
  })

  if (error) throw error

  const linha = (data ?? [])[0]

  if (!linha) return null

  return {
    sequencial: linha.sequencial,
    nome: linha.nome,
    descricao: linha.descricao,
    fotos: linha.fotos ?? [],
    ativo: linha.ativo,
    createdAt: linha.created_at,
  }
}

export async function atualizarProduto(
  sequencial: string,
  nome: string,
  descricao: string,
  fotos: string[]
): Promise<void> {
  const client = exigirSupabase()

  const { error } = await client.rpc('atualizar_produto', {
    p_sequencial: sequencial,
    p_nome: nome,
    p_descricao: descricao,
    p_fotos: fotos,
  })

  if (error) throw error
}

export async function ativarProduto(
  sequencial: string
): Promise<void> {
  const client = exigirSupabase()

  const { error } = await client.rpc('ativar_produto', {
    p_sequencial: sequencial,
  })

  if (error) throw error
}

export async function obterProdutoPublico(
  sequencial: string
): Promise<ProdutoPublico> {
  const client = exigirSupabase()

  const { data, error } = await client.rpc(
    'obter_produto_publico',
    {
      p_sequencial: sequencial,
    }
  )

  if (error) throw error

  const linha = (data ?? [])[0]

  return (
    linha ?? {
      existe: false,
      ativo: false,
      nome: null,
      descricao: null,
      fotos: null,
    }
  )
}

export async function uploadFoto(
  sequencial: string,
  arquivo: File
): Promise<string> {
  const client = exigirSupabase()

  const caminho = `${sequencial}/${Date.now()}-${arquivo.name}`

  const { error } = await client.storage
    .from(BUCKET_FOTOS)
    .upload(caminho, arquivo, {
      contentType: arquivo.type,
      cacheControl: '31536000',
      upsert: false,
    })

  if (error) throw error

  const { data } = client.storage
    .from(BUCKET_FOTOS)
    .getPublicUrl(caminho)

  return data.publicUrl
}

export { supabaseConfigurado }