-- Fase 2: cole este arquivo inteiro no SQL editor do projeto Supabase.
-- Escrita na tabela `produtos` só acontece através das funções abaixo
-- (security definer) — não há policy de insert/update/delete para anon,
-- porque a anon key vai para o bundle JS e é pública por natureza.

create sequence if not exists sequencial_produtos start 1;

create table if not exists produtos (
  id uuid primary key default gen_random_uuid(),
  sequencial text unique not null,
  nome text,
  descricao text,
  fotos text[] not null default '{}',
  ativo boolean not null default false,
  created_at timestamptz not null default now()
);

alter table produtos enable row level security;

-- só linhas ativas aparecem no endpoint REST genérico do Supabase
-- (select=*); produtos ainda não ativados só são lidos via os RPCs abaixo.
create policy "leitura_publica_ativos" on produtos
  for select using (ativo = true);

create or replace function reservar_produtos(p_nome text, p_quantidade int, p_digitos int default 6)
returns setof text
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_id bigint;
begin
  if p_quantidade < 1 or p_quantidade > 500 then
    raise exception 'quantidade fora do intervalo permitido (1-500)';
  end if;

  for i in 1..p_quantidade loop
    v_id := nextval('sequencial_produtos');
    insert into produtos(sequencial, nome) values (lpad(v_id::text, p_digitos, '0'), p_nome);
    return query select lpad(v_id::text, p_digitos, '0');
  end loop;
end;
$$;

create or replace function atualizar_produto(p_sequencial text, p_nome text, p_descricao text, p_fotos text[])
returns void
language sql
security definer
set search_path = public, pg_temp
as $$
  update produtos
  set nome = p_nome, descricao = p_descricao, fotos = p_fotos
  where sequencial = p_sequencial;
$$;

create or replace function ativar_produto(p_sequencial text)
returns void
language sql
security definer
set search_path = public, pg_temp
as $$
  update produtos set ativo = true where sequencial = p_sequencial;
$$;

-- usado pela página pública /q/:sequencial. Nunca vaza nome/descrição/fotos
-- de um produto ainda não ativado, mesmo sabendo o sequencial exato.
create or replace function obter_produto_publico(p_sequencial text)
returns table(existe boolean, ativo boolean, nome text, descricao text, fotos text[])
language sql
security definer
set search_path = public, pg_temp
as $$
  select
    exists(select 1 from produtos p where p.sequencial = p_sequencial),
    coalesce((select p.ativo from produtos p where p.sequencial = p_sequencial), false),
    case when (select p.ativo from produtos p where p.sequencial = p_sequencial) then (select p.nome from produtos p where p.sequencial = p_sequencial) end,
    case when (select p.ativo from produtos p where p.sequencial = p_sequencial) then (select p.descricao from produtos p where p.sequencial = p_sequencial) end,
    case when (select p.ativo from produtos p where p.sequencial = p_sequencial) then (select p.fotos from produtos p where p.sequencial = p_sequencial) end;
$$;

-- usado pela tela de Cadastro, retorna a linha completa independente de
-- `ativo`. Sem autenticação nesta fase, qualquer pessoa com a anon key
-- pode chamar isso varrendo sequenciais — risco aceito para o MVP (ver
-- claude.md), dado que o dado é nome/foto de móvel, não é sensível.
create or replace function buscar_produto_admin(p_sequencial text)
returns table(sequencial text, nome text, descricao text, fotos text[], ativo boolean, created_at timestamptz)
language sql
security definer
set search_path = public, pg_temp
as $$
  select p.sequencial, p.nome, p.descricao, p.fotos, p.ativo, p.created_at
  from produtos p
  where p.sequencial = p_sequencial;
$$;

-- Storage: crie manualmente no painel um bucket público "fotos-produtos"
-- com file_size_limit = 5MB. "Público" só controla a LEITURA via URL
-- pública — não libera upload. Upload (insert) sempre passa pela RLS de
-- storage.objects, que precisa das policies abaixo mesmo em bucket público.
create policy "upload_fotos_produtos" on storage.objects
  for insert
  with check (bucket_id = 'fotos-produtos');

create policy "leitura_fotos_produtos" on storage.objects
  for select
  using (bucket_id = 'fotos-produtos');
