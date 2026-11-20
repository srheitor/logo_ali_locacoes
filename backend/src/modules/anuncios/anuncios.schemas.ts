import { z } from 'zod';
import { optionalText, queryBoolean, queryList } from '../../lib/validation.js';
import { STATUS_ANUNCIO, TIPOS_IMOVEL } from '../../types/domain.js';

export const ORDENACOES = ['recentes', 'menor_preco', 'maior_preco', 'distancia', 'avaliacao', 'populares'] as const;

/** RF05 — filtros da busca pública (query string). */
export const buscaQuery = z.object({
  valor_min: z.coerce.number().nonnegative().optional(),
  valor_max: z.coerce.number().positive().optional(),
  tipo: queryList(z.enum(TIPOS_IMOVEL)),
  mobiliado: queryBoolean,
  disponibilidade_imediata: queryBoolean,
  quartos_min: z.coerce.number().int().nonnegative().optional(),
  comodidade: queryList(z.uuid()),
  campus_id: z.uuid().optional(),
  distancia_max_km: z.coerce.number().positive().optional(),
  q: optionalText(100),
  ordenar: z.enum(ORDENACOES).default('recentes'),
  limite: z.coerce.number().int().min(1).max(200).default(50),
  pagina: z.coerce.number().int().min(1).default(1),
});
export type BuscaFiltro = z.infer<typeof buscaQuery>;

/**
 * RF03 — criação/edição de anúncio (RN06: mínimo 3 fotos; RN07: valor > 0, quartos >= 0).
 * O schema guarda o endereço numa única coluna: CEP, bairro, cidade e UF são opcionais
 * e entram no texto de `endereco` (ex.: "Rua X, 420 – São Pedro – Juiz de Fora/MG – CEP 36036-330").
 */
export const anuncioSchema = z.object({
  titulo: z.string().trim().min(5).max(120),
  descricao: z.string().trim().min(10).max(5000),
  valor_aluguel: z.number().positive('O valor do aluguel deve ser maior que zero.'),
  tipo_imovel: z.enum(TIPOS_IMOVEL),
  quantidade_quartos: z.number().int().nonnegative('A quantidade de quartos não pode ser negativa.'),
  mobiliado: z.boolean().default(false),
  disponibilidade_imediata: z.boolean().default(false),
  endereco: z.string().trim().min(3).max(300),
  bairro: optionalText(100),
  cidade: optionalText(100),
  uf: optionalText(2),
  cep: optionalText(9),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  fotos: z.array(z.string().trim().min(1)).min(3, 'O anúncio precisa de no mínimo 3 fotos.').max(20),
  comodidades: z.array(z.uuid()).default([]),
  regras: z.array(z.string().trim().max(200)).max(30).default([]),
});
export type AnuncioInput = z.infer<typeof anuncioSchema>;

/** RN08 — status informado pelo proprietário (EXPIRADO é só automático). */
export const statusSchema = z.object({
  status: z.enum(STATUS_ANUNCIO).exclude(['EXPIRADO']),
});
