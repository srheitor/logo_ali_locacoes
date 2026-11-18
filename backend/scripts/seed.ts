/**
 * Povoamento inicial (seção 13 da documentação).
 *
 * Reaproveita os dados fictícios do front (src/mocks), para o banco ter os mesmos cenários
 * da demonstração. Senha de todos os usuários: 123456 (gravada com bcrypt em USUARIO.senha_hash).
 *
 * - IDs dos mocks ("an-01", "usr-aluno"…) viram UUIDs determinísticos: rodar de novo não duplica (upsert).
 * - Datas são relativas a "agora": visitas futuras e anúncios vigentes continuam válidos.
 * - Campos que o schema não tem são adaptados: CEP/bairro/cidade/UF entram no texto de `endereco`,
 *   o motivo de cancelamento da visita entra em `observacao`; CPF e data de nascimento são ignorados.
 *
 * Uso:
 *   npm run seed              → cria/atualiza os dados de demonstração
 *   npm run seed -- --limpar  → remove os dados de demonstração (e o que foi criado pelos usuários de demo)
 */
import bcrypt from 'bcryptjs';
import { createSeed, DEMO_SENHA } from '@/mocks/index.ts';
import { supabaseAdmin, T } from '../src/lib/supabase.ts';
import { aplicarFotosDemo, removerFotosDemo } from './fotos-demo.ts';
import { uuidDoMock } from './ids.ts';

/** Usuários do mock cujo e-mail já existe no banco → id do usuário real (que não é sobrescrito). */
const existentes = new Map<string, string>();

/** UUID determinístico a partir do id do mock. */
function uuid(chave: string) {
  return existentes.get(chave) ?? uuidDoMock(chave);
}

const db = createSeed();
const ids = (rows: { id: string }[]) => rows.map((r) => uuid(r.id));

function falhou(acao: string, tabela: string, error: { message: string; code?: string }) {
  throw new Error(`Falha ao ${acao} "${tabela}": ${error.message}${error.code ? ` (${error.code})` : ''}`);
}

async function upsert(tabela: string, rows: Record<string, unknown>[], onConflict = 'id') {
  if (rows.length === 0) return;
  const { error } = await supabaseAdmin.from(tabela).upsert(rows, { onConflict });
  if (error) falhou('povoar', tabela, error);
  console.log(`  ✔ ${tabela.padEnd(20)} ${rows.length}`);
}

async function povoar() {
  console.log('Povoando o banco do Supabase…');
  const hash = await bcrypt.hash(DEMO_SENHA, 10);

  // Usuários reais com o mesmo e-mail de um usuário de demo são reaproveitados, sem alterar senha nem dados.
  const { data: jaCadastrados, error } = await supabaseAdmin
    .from(T.usuario)
    .select('id, email')
    .in('email', db.usuarios.map((u) => u.email.toLowerCase()));
  if (error) falhou('ler', T.usuario, error);
  for (const u of db.usuarios) {
    const real = jaCadastrados?.find((r) => r.email === u.email.toLowerCase());
    if (real && real.id !== uuid(u.id)) {
      existentes.set(u.id, real.id as string);
      console.log(`  • ${u.email} já existe: mantido como está (senha não alterada)`);
    }
  }
  const novo = (mockId: string) => !existentes.has(mockId);

  await upsert(T.instituicao, db.instituicoes.map((i) => ({ ...i, id: uuid(i.id) })));
  await upsert(T.campus, db.campi.map((c) => ({ ...c, id: uuid(c.id), instituicao_id: uuid(c.instituicao_id) })));
  await upsert(T.comodidade, db.comodidades.map((c) => ({ ...c, id: uuid(c.id) })));

  await upsert(
    T.usuario,
    db.usuarios.filter((u) => novo(u.id)).map((u) => ({
      id: uuid(u.id),
      nome: u.nome,
      email: u.email.toLowerCase(),
      telefone: u.telefone,
      senha_hash: hash,
      tipo_usuario: u.tipo_usuario,
      foto_perfil_url: u.foto_perfil_url ?? null,
      ativo: u.ativo,
      criado_em: u.criado_em,
      atualizado_em: u.atualizado_em,
    })),
  );
  await upsert(
    T.estudante,
    db.estudantes.filter((e) => novo(e.usuario_id)).map((e) => ({
      usuario_id: uuid(e.usuario_id),
      campus_id: uuid(e.campus_id),
      matricula: e.matricula,
      verificado: e.verificado,
      bio_preferencias: e.bio_preferencias ?? null,
      criado_em: e.criado_em,
    })),
    'usuario_id',
  );
  await upsert(T.proprietario, db.proprietarios.filter((p) => novo(p.usuario_id)).map((p) => ({ ...p, usuario_id: uuid(p.usuario_id) })), 'usuario_id');

  await upsert(
    T.anuncio,
    db.anuncios.map(({ cep, bairro, cidade, uf, endereco, ...a }) => ({
      ...a,
      id: uuid(a.id),
      proprietario_id: uuid(a.proprietario_id),
      endereco: [endereco, bairro, `${cidade}/${uf}`, cep && `CEP ${cep}`].filter(Boolean).join(' – '),
    })),
  );
  await upsert(T.foto, db.fotos.map((f) => ({ ...f, id: uuid(f.id), anuncio_id: uuid(f.anuncio_id) })));
  await upsert(T.regra, db.regras.map((r) => ({ ...r, id: uuid(r.id), anuncio_id: uuid(r.anuncio_id) })));
  await upsert(
    T.anuncioComodidade,
    db.anuncioComodidades.map((ac) => ({ anuncio_id: uuid(ac.anuncio_id), comodidade_id: uuid(ac.comodidade_id) })),
    'anuncio_id,comodidade_id',
  );

  await upsert(
    T.vinculo,
    db.vinculos.map((v) => ({
      id: uuid(v.id),
      estudante_id: uuid(v.estudante_id),
      tipo_verificacao: v.tipo_verificacao,
      email_institucional: v.email_institucional ?? null,
      identificador_documento_url: v.identificador_documento_url ?? null,
      status: v.status,
      analisado_por_admin_id: v.analisado_por_admin_id ? uuid(v.analisado_por_admin_id) : null,
      enviado_em: v.enviado_em,
      analisado_em: v.analisado_em ?? null,
      motivo_reprovacao: v.motivo_reprovacao ?? null,
    })),
  );
  await upsert(
    T.favorito,
    db.favoritos.map((f) => ({ estudante_id: uuid(f.estudante_id), anuncio_id: uuid(f.anuncio_id), criado_em: f.criado_em })),
    'estudante_id,anuncio_id',
  );
  await upsert(
    T.conversa,
    db.conversas.map((c) => ({
      ...c,
      id: uuid(c.id),
      estudante_id: uuid(c.estudante_id),
      proprietario_id: uuid(c.proprietario_id),
      anuncio_id: uuid(c.anuncio_id),
      encerrada_em: c.encerrada_em ?? null,
    })),
  );
  await upsert(
    T.mensagem,
    db.mensagens.map((m) => ({
      ...m,
      id: uuid(m.id),
      conversa_id: uuid(m.conversa_id),
      remetente_id: uuid(m.remetente_id),
      lido_em: m.lido_em ?? null,
    })),
  );
  await upsert(
    T.visita,
    db.visitas.map(({ motivo_cancelamento, ...v }) => ({
      ...v,
      id: uuid(v.id),
      estudante_id: uuid(v.estudante_id),
      anuncio_id: uuid(v.anuncio_id),
      observacao:
        [v.observacao, motivo_cancelamento && `[${v.status === 'RECUSADA' ? 'Recusada' : 'Cancelada'}] ${motivo_cancelamento}`]
          .filter(Boolean)
          .join('\n') || null,
    })),
  );
  await upsert(
    T.avaliacao,
    db.avaliacoes.map((a) => ({
      ...a,
      id: uuid(a.id),
      estudante_id: uuid(a.estudante_id),
      anuncio_id: uuid(a.anuncio_id),
      comentario: a.comentario ?? null,
    })),
  );
  await upsert(
    T.moderacao,
    db.moderacoes.map((m) => ({
      ...m,
      id: uuid(m.id),
      anuncio_id: uuid(m.anuncio_id),
      admin_id: uuid(m.admin_id),
      justificativa: m.justificativa ?? null,
    })),
  );

  // Fotos reais (Storage) para os anúncios que têm pasta em scripts/fotos-demo.
  await aplicarFotosDemo();

  console.log(`\nPronto! Logins de demonstração (senha ${DEMO_SENHA}):`);
  for (const u of db.usuarios) {
    const obs = existentes.has(u.id) ? '  (usuário já existente: senha própria)' : '';
    console.log(`  ${u.tipo_usuario.padEnd(13)} ${u.email}${obs}`);
  }
}

/** Remove os dados de demonstração e tudo o que os usuários de demo criaram (ordem inversa das FKs). */
async function limpar() {
  console.log('Removendo os dados de demonstração…');
  const usuarios = ids(db.usuarios).join(',');

  const { data: anunciosDemo, error } = await supabaseAdmin.from(T.anuncio).select('id').in('proprietario_id', ids(db.usuarios));
  if (error) falhou('ler', T.anuncio, error);
  const anuncios = [...new Set([...ids(db.anuncios), ...(anunciosDemo ?? []).map((a) => a.id as string)])].join(',');

  const { data: conversasDemo, error: errConv } = await supabaseAdmin
    .from(T.conversa)
    .select('id')
    .or(`estudante_id.in.(${usuarios}),proprietario_id.in.(${usuarios}),anuncio_id.in.(${anuncios})`);
  if (errConv) falhou('ler', T.conversa, errConv);
  const conversas = (conversasDemo ?? []).map((c) => c.id as string).join(',') || '00000000-0000-0000-0000-000000000000';

  const etapas: [string, string][] = [
    [T.moderacao, `anuncio_id.in.(${anuncios}),admin_id.in.(${usuarios})`],
    [T.avaliacao, `anuncio_id.in.(${anuncios}),estudante_id.in.(${usuarios})`],
    [T.visita, `anuncio_id.in.(${anuncios}),estudante_id.in.(${usuarios})`],
    [T.mensagem, `conversa_id.in.(${conversas}),remetente_id.in.(${usuarios})`],
    [T.conversa, `id.in.(${conversas})`],
    [T.favorito, `anuncio_id.in.(${anuncios}),estudante_id.in.(${usuarios})`],
    [T.vinculo, `estudante_id.in.(${usuarios}),analisado_por_admin_id.in.(${usuarios})`],
    [T.foto, `anuncio_id.in.(${anuncios})`],
    [T.regra, `anuncio_id.in.(${anuncios})`],
    [T.anuncioComodidade, `anuncio_id.in.(${anuncios})`],
    [T.anuncio, `id.in.(${anuncios})`],
    [T.estudante, `usuario_id.in.(${usuarios})`],
    [T.proprietario, `usuario_id.in.(${usuarios})`],
    [T.usuario, `id.in.(${usuarios})`],
    [T.comodidade, `id.in.(${ids(db.comodidades).join(',')})`],
    [T.campus, `id.in.(${ids(db.campi).join(',')})`],
    [T.instituicao, `id.in.(${ids(db.instituicoes).join(',')})`],
  ];

  for (const [tabela, filtro] of etapas) {
    const { data, error: err } = await supabaseAdmin.from(tabela).delete().or(filtro).select();
    if (err) falhou('limpar', tabela, err);
    console.log(`  ✔ ${tabela.padEnd(20)} ${data?.length ?? 0} removido(s)`);
  }
  console.log(`  ✔ ${'Storage (demo/)'.padEnd(20)} ${await removerFotosDemo()} arquivo(s) removido(s)`);
}

(process.argv.includes('--limpar') ? limpar() : povoar()).catch((err) => {
  console.error('\n❌', err instanceof Error ? err.message : err);
  process.exit(1);
});
