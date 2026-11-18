/**
 * Cria os buckets do Supabase Storage usados pela API (seção 12, item 9 da documentação):
 * avatars (público), anuncios (público) e documentos (privado). Idempotente.
 *
 * Uso: npm run setup:storage
 */
import { garantirBuckets } from './fotos-demo.ts';

await garantirBuckets();
console.log('Buckets prontos.');
