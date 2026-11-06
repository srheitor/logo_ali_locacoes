import type {
  Avaliacao,
  Conversa,
  Favorito,
  Mensagem,
  ModeracaoAnuncio,
  VinculoEstudantil,
  Visita,
} from '@/shared/types/domain';
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
  { id: 'mod-5', anuncio_id: 'an-06', admin_id: 'usr-admin', acao: 'REJEITADO', justificativa: 'Menos de 3 fotos enviadas (RN06).', realizado_em: daysFromNow(-12) },
  { id: 'mod-6', anuncio_id: 'an-06', admin_id: 'usr-admin', acao: 'APROVADO', justificativa: 'Fotos corrigidas.', realizado_em: daysFromNow(-10) },
];
