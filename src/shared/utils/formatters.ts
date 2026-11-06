import type {
  AcaoModeracao,
  StatusAnuncio,
  StatusVerificacao,
  StatusVisita,
  TipoImovel,
  TipoUsuario,
} from '../types/domain';

export const formatCurrency = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export const formatDate = (iso: string) => new Date(iso).toLocaleDateString('pt-BR');

export const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });

export const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

/** "1990-05-20" -> "20/05/1990" */
export const isoToBrDate = (iso?: string) => {
  if (!iso) return '';
  const [y, m, d] = iso.slice(0, 10).split('-');
  return `${d}/${m}/${y}`;
};

/** "20/05/1990" -> "1990-05-20" */
export const brDateToIso = (br: string) => {
  const [d, m, y] = br.split('/');
  return `${y}-${m}-${d}`;
};

export const initials = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('');

// ---------- Rótulos amigáveis dos enums ----------
export const tipoUsuarioLabel: Record<TipoUsuario, string> = {
  ESTUDANTE: 'Aluno',
  PROPRIETARIO: 'Proprietário',
  ADMIN: 'Administrador',
};

export const tipoImovelLabel: Record<TipoImovel, string> = {
  KITNET: 'Kitnet',
  APARTAMENTO: 'Apartamento',
  CASA: 'Casa',
  QUARTO: 'Quarto',
};

export const statusAnuncioLabel: Record<StatusAnuncio, string> = {
  DISPONIVEL: 'Disponível',
  ALUGADO: 'Alugado',
  INDISPONIVEL: 'Pausado',
  EXPIRADO: 'Expirado',
};

export const statusVisitaLabel: Record<StatusVisita, string> = {
  SOLICITADA: 'Solicitada',
  CONFIRMADA: 'Confirmada',
  RECUSADA: 'Recusada',
  REALIZADA: 'Realizada',
  CANCELADA: 'Cancelada',
};

export const statusVerificacaoLabel: Record<StatusVerificacao, string> = {
  PENDENTE: 'Pendente',
  APROVADO: 'Aprovado',
  REPROVADO: 'Reprovado',
};

export const acaoModeracaoLabel: Record<AcaoModeracao, string> = {
  APROVADO: 'Aprovado',
  REJEITADO: 'Rejeitado',
  BLOQUEADO: 'Bloqueado',
};
