/**
 * Conversões entre o schema do banco e os campos que o front usa
 * (o banco guarda endereço e motivo da visita em colunas de texto únicas).
 */

/** "Rua X, 420 – São Pedro – Juiz de Fora/MG – CEP 36036-330" */
export function montarEndereco(e: { endereco: string; bairro?: string; cidade?: string; uf?: string; cep?: string }) {
  const local = [e.cidade, e.uf?.toUpperCase()].filter(Boolean).join('/');
  return [e.endereco, e.bairro, local, e.cep && `CEP ${e.cep}`].filter(Boolean).join(' – ');
}

/** Inverso de `montarEndereco` (textos em outro formato voltam inteiros em `endereco`). */
export function desmontarEndereco(texto: string | null) {
  const partes = (texto ?? '').split(' – ').map((p) => p.trim()).filter(Boolean);
  const resultado = { endereco: partes.shift() ?? '', bairro: '', cidade: '', uf: '', cep: '' };
  for (const parte of partes) {
    const cep = /^CEP\s+(.+)$/.exec(parte);
    const cidadeUf = /^(.+)\/([A-Za-z]{2})$/.exec(parte);
    if (cep) resultado.cep = cep[1]!;
    else if (cidadeUf) [resultado.cidade, resultado.uf] = [cidadeUf[1]!, cidadeUf[2]!.toUpperCase()];
    else resultado.bairro = resultado.bairro ? `${resultado.bairro} – ${parte}` : parte;
  }
  return resultado;
}

/** Linha de motivo anexada em VISITA.observacao: "[Cancelada pelo estudante em <data>] motivo". */
export const linhaMotivo = (rotulo: string, motivo: string) => `[${rotulo}] ${motivo.trim()}`;

/** Separa a observação original do motivo de cancelamento/recusa anexado. */
export function separarObservacao(texto: string | null) {
  const linhas = (texto ?? '').split('\n');
  const motivos = linhas.filter((l) => /^\[[^\]]+\]/.test(l));
  const observacao = linhas.filter((l) => !/^\[[^\]]+\]/.test(l)).join('\n').trim();
  const ultimo = motivos.at(-1)?.replace(/^\[[^\]]+\]\s*/, '');
  return { observacao: observacao || null, motivo_cancelamento: ultimo || null };
}
