/**
 * Cria os buckets do Supabase Storage usados pela API (seção 12, item 9 da documentação).
 * Idempotente: buckets que já existem são mantidos.
 *
 * Uso: npm run setup:storage
 */
import { supabaseAdmin } from '../src/lib/supabase.ts';

const IMAGENS = ['image/jpeg', 'image/png', 'image/webp'];

const BUCKETS = [
  { id: 'avatars', public: true, fileSizeLimit: '5MB', allowedMimeTypes: IMAGENS },
  { id: 'anuncios', public: true, fileSizeLimit: '10MB', allowedMimeTypes: IMAGENS },
  { id: 'documentos', public: false, fileSizeLimit: '10MB', allowedMimeTypes: [...IMAGENS, 'application/pdf'] },
];

const { data: existentes, error } = await supabaseAdmin.storage.listBuckets();
if (error) throw error;

for (const { id, ...opcoes } of BUCKETS) {
  if (existentes.some((b) => b.id === id)) {
    console.log(`  • ${id} já existe`);
    continue;
  }
  const { error: err } = await supabaseAdmin.storage.createBucket(id, opcoes);
  if (err) throw err;
  console.log(`  ✔ ${id} criado (${opcoes.public ? 'público' : 'privado'})`);
}
