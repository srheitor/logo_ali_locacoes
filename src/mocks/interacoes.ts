import type {
  Avaliacao,
  Conversa,
  Favorito,
  Mensagem,
  ModeracaoAnuncio,
  VinculoEstudantil,
  Visita,
} from '@/shared/types/domain';
import { anuncios } from './anuncios';
import { daysFromNow } from './helpers';

// ---------- Favoritos (RF07) ----------
export const favoritos: Favorito[] = [
  { id: 'fav-1', estudante_id: 'usr-aluno', anuncio_id: 'an-02', criado_em: daysFromNow(-5) },
  { id: 'fav-2', estudante_id: 'usr-aluno', anuncio_id: 'an-04', criado_em: daysFromNow(-3) },
  { id: 'fav-3', estudante_id: 'usr-aluno', anuncio_id: 'an-03', criado_em: daysFromNow(-1) },
  { id: 'fav-4', estudante_id: 'usr-aluno-2', anuncio_id: 'an-01', criado_em: daysFromNow(-2) },
  { id: 'fav-5', estudante_id: 'usr-aluno-3', anuncio_id: 'an-04', criado_em: daysFromNow(-6) },
  { id: 'fav-6', estudante_id: 'usr-aluno-4', anuncio_id: 'an-03', criado_em: daysFromNow(-8) },
];

// ---------- Chat (RF08 / RN04) ----------
export const conversas: Conversa[] = [
  { id: 'conv-1', estudante_id: 'usr-aluno', proprietario_id: 'usr-prop', anuncio_id: 'an-02', criado_em: daysFromNow(-4, 9), atualizado_em: daysFromNow(-1, 18, 40) },
  { id: 'conv-2', estudante_id: 'usr-aluno', proprietario_id: 'usr-prop-2', anuncio_id: 'an-04', criado_em: daysFromNow(-3, 14), atualizado_em: daysFromNow(-2, 10, 5) },
  { id: 'conv-3', estudante_id: 'usr-aluno-2', proprietario_id: 'usr-prop', anuncio_id: 'an-01', criado_em: daysFromNow(-2, 20), atualizado_em: daysFromNow(-1, 8, 15) },
];

export const mensagens: Mensagem[] = [
  { id: 'msg-1', conversa_id: 'conv-1', remetente_id: 'usr-aluno', conteudo: 'Olá! A kitnet ainda está disponível? Estudo no Campus Sede.', enviado_em: daysFromNow(-4, 9), lido_em: daysFromNow(-4, 10) },
  { id: 'msg-2', conversa_id: 'conv-1', remetente_id: 'usr-prop', conteudo: 'Oi, Ana! Está sim. Fica a uns 8 minutos a pé do portão norte.', enviado_em: daysFromNow(-4, 10, 30), lido_em: daysFromNow(-4, 11) },
  { id: 'msg-3', conversa_id: 'conv-1', remetente_id: 'usr-aluno', conteudo: 'Ótimo! Precisa de fiador?', enviado_em: daysFromNow(-3, 8), lido_em: daysFromNow(-3, 9) },
  { id: 'msg-4', conversa_id: 'conv-1', remetente_id: 'usr-prop', conteudo: 'Não precisa. Peço só a caução de um aluguel. Confirmei sua visita para depois de amanhã às 15h 🙂', enviado_em: daysFromNow(-1, 18, 40) },
  { id: 'msg-5', conversa_id: 'conv-2', remetente_id: 'usr-aluno', conteudo: 'Boa tarde! A internet inclusa é fibra?', enviado_em: daysFromNow(-3, 14), lido_em: daysFromNow(-3, 15) },
  { id: 'msg-6', conversa_id: 'conv-2', remetente_id: 'usr-prop-2', conteudo: 'Boa tarde! Sim, fibra de 300 Mb compartilhada no prédio.', enviado_em: daysFromNow(-2, 10, 5), lido_em: daysFromNow(-2, 12) },
  { id: 'msg-7', conversa_id: 'conv-3', remetente_id: 'usr-aluno-2', conteudo: 'Olá, o quarto tem escrivaninha?', enviado_em: daysFromNow(-2, 20), lido_em: daysFromNow(-2, 21) },
  { id: 'msg-8', conversa_id: 'conv-3', remetente_id: 'usr-prop', conteudo: 'Tem sim, e uma estante também.', enviado_em: daysFromNow(-1, 8, 15) },
];

// ---------- Visitas (RF11 / RN02) ----------
export const visitas: Visita[] = [
  { id: 'vis-1', estudante_id: 'usr-aluno', anuncio_id: 'an-02', data_hora: daysFromNow(2, 15), status: 'CONFIRMADA', observacao: 'Vou com minha mãe.', criado_em: daysFromNow(-3), atualizado_em: daysFromNow(-1) },
  { id: 'vis-2', estudante_id: 'usr-aluno', anuncio_id: 'an-04', data_hora: daysFromNow(4, 10), status: 'SOLICITADA', criado_em: daysFromNow(-1), atualizado_em: daysFromNow(-1) },
  { id: 'vis-3', estudante_id: 'usr-aluno', anuncio_id: 'an-05', data_hora: daysFromNow(-12, 17), status: 'REALIZADA', criado_em: daysFromNow(-15), atualizado_em: daysFromNow(-12) },
  { id: 'vis-4', estudante_id: 'usr-aluno-2', anuncio_id: 'an-01', data_hora: daysFromNow(3, 18), status: 'SOLICITADA', observacao: 'Posso só depois das 18h por causa das aulas.', criado_em: daysFromNow(-1), atualizado_em: daysFromNow(-1) },
  { id: 'vis-5', estudante_id: 'usr-aluno-4', anuncio_id: 'an-01', data_hora: daysFromNow(1, 9), status: 'CANCELADA', motivo_cancelamento: 'Encontrei outro imóvel.', criado_em: daysFromNow(-6), atualizado_em: daysFromNow(-2) },
  { id: 'vis-6', estudante_id: 'usr-aluno-3', anuncio_id: 'an-03', data_hora: daysFromNow(5, 14), status: 'RECUSADA', motivo_cancelamento: 'Horário indisponível.', criado_em: daysFromNow(-4), atualizado_em: daysFromNow(-3) },
];

// ---------- Avaliações (RN09: nota 1 a 5) ----------
export const avaliacoes: Avaliacao[] = [
  { id: 'ava-1', estudante_id: 'usr-aluno-4', anuncio_id: 'an-01', nota: 5, comentario: 'Casa muito tranquila e proprietário atencioso.', criado_em: daysFromNow(-40), atualizado_em: daysFromNow(-40) },
  { id: 'ava-2', estudante_id: 'usr-aluno-5', anuncio_id: 'an-01', nota: 4, comentario: 'Ótima localização, chuveiro poderia ser melhor.', criado_em: daysFromNow(-80), atualizado_em: daysFromNow(-80) },
  { id: 'ava-3', estudante_id: 'usr-aluno', anuncio_id: 'an-05', nota: 3, comentario: 'Casa boa, mas precisa de manutenção na cozinha.', criado_em: daysFromNow(-11), atualizado_em: daysFromNow(-11) },
  { id: 'ava-4', estudante_id: 'usr-aluno-3', anuncio_id: 'an-04', nota: 5, comentario: 'Localização perfeita para quem estuda no Centro.', criado_em: daysFromNow(-25), atualizado_em: daysFromNow(-25) },
  { id: 'ava-5', estudante_id: 'usr-aluno-4', anuncio_id: 'an-02', nota: 4, criado_em: daysFromNow(-50), atualizado_em: daysFromNow(-50) },
];

// ---------- Verificação de vínculo (RF09 / RN01) ----------
export const vinculos: VinculoEstudantil[] = [
  { id: 'vin-1', estudante_id: 'usr-aluno', tipo_verificacao: 'EMAIL_INSTITUCIONAL', email_institucional: 'ana.souza@estudante.ufjf.br', identificador_documento_url: 'comprovante-ana.pdf', status: 'APROVADO', enviado_em: daysFromNow(-58), analisado_em: daysFromNow(-58) },
  { id: 'vin-2', estudante_id: 'usr-aluno-2', tipo_verificacao: 'EMAIL_INSTITUCIONAL', email_institucional: 'pedro.lima@estudante.ufjf.br', status: 'PENDENTE', enviado_em: daysFromNow(-1) },
  { id: 'vin-3', estudante_id: 'usr-aluno-3', tipo_verificacao: 'COMPROVANTE', identificador_documento_url: 'carteirinha-julia.jpg', status: 'REPROVADO', analisado_por_admin_id: 'usr-admin', enviado_em: daysFromNow(-30), analisado_em: daysFromNow(-29), motivo_reprovacao: 'Documento ilegível.' },
  { id: 'vin-4', estudante_id: 'usr-aluno-3', tipo_verificacao: 'COMPROVANTE', identificador_documento_url: 'declaracao-matricula-julia.pdf', status: 'PENDENTE', enviado_em: daysFromNow(-2) },
  { id: 'vin-5', estudante_id: 'usr-aluno-4', tipo_verificacao: 'EMAIL_INSTITUCIONAL', email_institucional: 'lucas.martins@estudante.ufjf.br', identificador_documento_url: 'comprovante-lucas.pdf', status: 'APROVADO', enviado_em: daysFromNow(-88), analisado_em: daysFromNow(-88) },
];

// ---------- Moderação (RF10) ----------
export const moderacoes: ModeracaoAnuncio[] = [
  { id: 'mod-1', anuncio_id: 'an-01', admin_id: 'usr-admin', acao: 'APROVADO', realizado_em: daysFromNow(-10) },
  { id: 'mod-2', anuncio_id: 'an-02', admin_id: 'usr-admin', acao: 'APROVADO', realizado_em: daysFromNow(-10) },
  { id: 'mod-3', anuncio_id: 'an-03', admin_id: 'usr-admin', acao: 'APROVADO', realizado_em: daysFromNow(-10) },
  { id: 'mod-4', anuncio_id: 'an-04', admin_id: 'usr-admin', acao: 'APROVADO', realizado_em: daysFromNow(-10) },
  { id: 'mod-5', anuncio_id: 'an-06', admin_id: 'usr-admin', acao: 'REJEITADO', justificativa: 'Menos de 3 fotos enviadas.', realizado_em: daysFromNow(-12) },
  { id: 'mod-6', anuncio_id: 'an-06', admin_id: 'usr-admin', acao: 'APROVADO', justificativa: 'Fotos corrigidas.', realizado_em: daysFromNow(-10) },
];

// ======================================================================
// Volume extra para a demonstração: 60 imóveis, 12 estudantes e 10 proprietários.
// Os registros abaixo são determinísticos, para o seed continuar idempotente.
// ======================================================================
const ESTUDANTES_DEMO = [
  'usr-aluno', 'usr-aluno-2', 'usr-aluno-3', 'usr-aluno-4', 'usr-aluno-5', 'usr-aluno-6',
  'usr-aluno-7', 'usr-aluno-8', 'usr-aluno-9', 'usr-aluno-10', 'usr-aluno-11', 'usr-aluno-12',
];

const ANUNCIOS_NOVOS = anuncios.filter((a) => Number(a.id.replace('an-', '')) >= 10);

// ---------- Favoritos ----------
const chaveFavorito = (estudanteId: string, anuncioId: string) => `${estudanteId}|${anuncioId}`;
const favoritosExistentes = new Set(favoritos.map((f) => chaveFavorito(f.estudante_id, f.anuncio_id)));
const favoritosExtras: Favorito[] = [];
for (let i = 0; favoritosExtras.length < 40 && i < 300; i++) {
  const estudante_id = ESTUDANTES_DEMO[i % ESTUDANTES_DEMO.length]!;
  const anuncio = ANUNCIOS_NOVOS[(i * 11 + 3) % ANUNCIOS_NOVOS.length]!;
  const chave = chaveFavorito(estudante_id, anuncio.id);
  if (favoritosExistentes.has(chave)) continue;
  favoritosExistentes.add(chave);
  favoritosExtras.push({
    id: `fav-${favoritos.length + favoritosExtras.length + 1}`,
    estudante_id,
    anuncio_id: anuncio.id,
    criado_em: daysFromNow(-((i % 25) + 1), 9 + (i % 8)),
  });
}
favoritos.push(...favoritosExtras);

// ---------- Visitas ----------
const STATUS_VISITA: Visita['status'][] = ['SOLICITADA', 'CONFIRMADA', 'REALIZADA', 'CANCELADA', 'RECUSADA', 'CONFIRMADA', 'SOLICITADA', 'REALIZADA'];
const visitasExtras: Visita[] = [];
const paresVisita = new Set(visitas.map((v) => chaveFavorito(v.estudante_id, v.anuncio_id)));
for (let i = 0; visitasExtras.length < 19 && i < 200; i++) {
  const estudante_id = ESTUDANTES_DEMO[(i + 4) % ESTUDANTES_DEMO.length]!;
  const anuncio = ANUNCIOS_NOVOS[(i * 13 + 7) % ANUNCIOS_NOVOS.length]!;
  const chave = chaveFavorito(estudante_id, anuncio.id);
  if (paresVisita.has(chave)) continue;
  paresVisita.add(chave);

  const status = STATUS_VISITA[i % STATUS_VISITA.length]!;
  const passada = status === 'REALIZADA' || status === 'CANCELADA' || status === 'RECUSADA';
  const dias = passada ? -((i % 25) + 2) : (i % 9) + 1;
  const motivo =
    status === 'CANCELADA'
      ? 'Encontrei outra opção em um bairro mais próximo.'
      : status === 'RECUSADA'
        ? 'Horário indisponível para o proprietário.'
        : undefined;

  visitasExtras.push({
    id: `vis-${visitas.length + visitasExtras.length + 1}`,
    estudante_id,
    anuncio_id: anuncio.id,
    data_hora: daysFromNow(dias, 9 + (i % 9)),
    status,
    observacao: i % 4 === 0 ? 'Vou com um familiar para conhecer o imóvel.' : undefined,
    motivo_cancelamento: motivo,
    criado_em: daysFromNow(Math.min(dias - 2, -1), 10 + (i % 8)),
    atualizado_em: daysFromNow(Math.min(dias, -1), 12 + (i % 7)),
  });
}
visitas.push(...visitasExtras);

// ---------- Avaliações ----------
const COMENTARIOS = [
  'Localização ótima, cheguei ao campus a pé em poucos minutos.',
  'Proprietário respondeu rápido e explicou tudo sobre o contrato.',
  'O quarto é exatamente como nas fotos e a internet funciona muito bem.',
  'Bom custo-benefício para a região, principalmente com as contas inclusas.',
  'Ambiente tranquilo e organizado, ótimo para estudar à noite.',
  'A cozinha é bem equipada e o espaço comum é limpo.',
  'Fica perto de mercado e ponto de ônibus, facilitou muito a rotina.',
  'Achei o imóvel um pouco menor do que parecia nas fotos, mas atende bem.',
  'Gostei bastante da vizinhança e do silêncio depois das 22h.',
  'Contrato justo e sem burocracia para estudantes.',
];
const avaliacoesExtras: Avaliacao[] = [];
const paresAvaliacao = new Set(avaliacoes.map((a) => chaveFavorito(a.estudante_id, a.anuncio_id)));
for (let i = 0; avaliacoesExtras.length < 25 && i < 200; i++) {
  const estudante_id = ESTUDANTES_DEMO[(i * 5 + 1) % ESTUDANTES_DEMO.length]!;
  const anuncio = ANUNCIOS_NOVOS[(i * 13 + 5) % ANUNCIOS_NOVOS.length]!;
  const chave = chaveFavorito(estudante_id, anuncio.id);
  if (paresAvaliacao.has(chave)) continue;
  paresAvaliacao.add(chave);
  const nota = 3 + (i % 3);
  avaliacoesExtras.push({
    id: `ava-${avaliacoes.length + avaliacoesExtras.length + 1}`,
    estudante_id,
    anuncio_id: anuncio.id,
    nota,
    comentario: COMENTARIOS[i % COMENTARIOS.length]!,
    criado_em: daysFromNow(-((i % 40) + 5), 14),
    atualizado_em: daysFromNow(-((i % 40) + 5), 14),
  });
}
avaliacoes.push(...avaliacoesExtras);

// ---------- Conversas e mensagens ----------
const MENSAGENS_ALUNO = [
  'Olá! O imóvel ainda está disponível para o próximo semestre?',
  'Boa tarde! Consigo agendar uma visita para esta semana?',
  'Oi! As contas de água e luz estão inclusas mesmo?',
  'A internet é fibra? Preciso estudar bastante em casa.',
  'Tem ponto de ônibus perto? Estudo no Campus Sede.',
];
const MENSAGENS_PROPRIETARIO = [
  'Olá! Está disponível sim. Posso te mostrar o imóvel amanhã à tarde.',
  'Boa tarde! Tenho horário na quinta às 15h ou na sexta pela manhã.',
  'Sim, água e luz estão inclusas. O Wi-Fi também é fibra.',
  'Fica a poucos minutos do campus e o ponto de ônibus é na esquina.',
  'Sem problema. Me avise qual horário funciona melhor para você.',
];
const conversasExtras: Conversa[] = [];
const mensagensExtras: Mensagem[] = [];
for (let i = 0; i < 7; i++) {
  const estudante_id = ESTUDANTES_DEMO[(i + 2) % ESTUDANTES_DEMO.length]!;
  const anuncio = ANUNCIOS_NOVOS[(i * 9 + 2) % ANUNCIOS_NOVOS.length]!;
  const conversaId = `conv-${conversas.length + i + 1}`;
  const inicio = -((i % 8) + 1);

  conversasExtras.push({
    id: conversaId,
    estudante_id,
    proprietario_id: anuncio.proprietario_id,
    anuncio_id: anuncio.id,
    criado_em: daysFromNow(inicio, 9),
    atualizado_em: daysFromNow(Math.min(inicio + 1, -1), 17, 30),
  });

  const totalMensagens = 2 + (i % 4);
  for (let m = 0; m < totalMensagens; m++) {
    const doAluno = m % 2 === 0;
    mensagensExtras.push({
      id: `msg-${mensagens.length + mensagensExtras.length + 1}`,
      conversa_id: conversaId,
      remetente_id: doAluno ? estudante_id : anuncio.proprietario_id,
      conteudo: doAluno
        ? MENSAGENS_ALUNO[(i + m) % MENSAGENS_ALUNO.length]!
        : MENSAGENS_PROPRIETARIO[(i + m) % MENSAGENS_PROPRIETARIO.length]!,
      enviado_em: daysFromNow(inicio, 9 + m),
      lido_em: m < totalMensagens - 1 ? daysFromNow(inicio, 10 + m) : undefined,
    });
  }
}
conversas.push(...conversasExtras);
mensagens.push(...mensagensExtras);

// ---------- Verificações ----------
const vinculosExtras: VinculoEstudantil[] = [
  { id: 'vin-6', estudante_id: 'usr-aluno-5', tipo_verificacao: 'COMPROVANTE', identificador_documento_url: 'declaracao-rafael.pdf', status: 'REPROVADO', analisado_por_admin_id: 'usr-admin', enviado_em: daysFromNow(-110), analisado_em: daysFromNow(-108), motivo_reprovacao: 'Documento vencido.' },
  { id: 'vin-7', estudante_id: 'usr-aluno-6', tipo_verificacao: 'EMAIL_INSTITUCIONAL', email_institucional: 'beatriz.nunes@estudante.ufjf.br', status: 'APROVADO', enviado_em: daysFromNow(-78), analisado_em: daysFromNow(-78) },
  { id: 'vin-8', estudante_id: 'usr-aluno-7', tipo_verificacao: 'COMPROVANTE', identificador_documento_url: 'matricula-gabriel.pdf', status: 'PENDENTE', enviado_em: daysFromNow(-3) },
  { id: 'vin-9', estudante_id: 'usr-aluno-8', tipo_verificacao: 'EMAIL_INSTITUCIONAL', email_institucional: 'marina.alves@estudante.ufjf.br', identificador_documento_url: 'comprovante-marina.pdf', status: 'APROVADO', enviado_em: daysFromNow(-137), analisado_em: daysFromNow(-137) },
  { id: 'vin-10', estudante_id: 'usr-aluno-9', tipo_verificacao: 'COMPROVANTE', identificador_documento_url: 'carteirinha-thiago.jpg', status: 'PENDENTE', enviado_em: daysFromNow(-2) },
  { id: 'vin-11', estudante_id: 'usr-aluno-10', tipo_verificacao: 'EMAIL_INSTITUCIONAL', email_institucional: 'camila.ferreira@uniacademia.edu.br', status: 'APROVADO', enviado_em: daysFromNow(-28), analisado_em: daysFromNow(-28) },
  { id: 'vin-12', estudante_id: 'usr-aluno-11', tipo_verificacao: 'COMPROVANTE', identificador_documento_url: 'declaracao-bruno.pdf', status: 'REPROVADO', analisado_por_admin_id: 'usr-admin', enviado_em: daysFromNow(-20), analisado_em: daysFromNow(-18), motivo_reprovacao: 'Nome ilegível no comprovante.' },
  { id: 'vin-13', estudante_id: 'usr-aluno-12', tipo_verificacao: 'EMAIL_INSTITUCIONAL', email_institucional: 'larissa.prado@estudante.ufjf.br', identificador_documento_url: 'comprovante-larissa.pdf', status: 'APROVADO', enviado_em: daysFromNow(-70), analisado_em: daysFromNow(-70) },
];
vinculos.push(...vinculosExtras);

// ---------- Moderação dos novos anúncios ----------
const moderacoesExtras: ModeracaoAnuncio[] = ANUNCIOS_NOVOS
  .filter((a) => a.aprovado_moderacao)
  .map((a, i) => {
    const diasPublicado = Math.round((Date.now() - new Date(a.data_publicacao).getTime()) / 86_400_000);
    return {
      id: `mod-${moderacoes.length + i + 1}`,
      anuncio_id: a.id,
      admin_id: 'usr-admin',
      acao: 'APROVADO' as const,
      justificativa: i % 9 === 0 ? 'Anúncio conferido e aprovado.' : undefined,
      realizado_em: daysFromNow(-Math.max(1, diasPublicado - 1), 11),
    };
  });
moderacoes.push(...moderacoesExtras);
