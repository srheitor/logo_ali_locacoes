/**
 * Fotos reais (domínio público/CC0 — ver fotos-demo/CREDITOS.md) para os anúncios de demonstração.
 *
 * Cada subpasta de `fotos-demo/` tem o id do anúncio nos mocks (ex.: "an-02") e as fotos
 * em ordem de exibição (a primeira é a capa). O script:
 *   1) cria os buckets do Storage, se ainda não existirem;
 *   2) envia as fotos para o bucket público "anuncios" (pasta demo/<id>/);
 *   3) substitui as fotos do anúncio em FOTO_ANUNCIO pelas URLs públicas.
 *
 * Uso: npm run seed:fotos   (o `npm run seed` também chama este passo)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { novoId, supabaseAdmin, T } from '../src/lib/supabase.ts';
import { uuidDoMock } from './ids.ts';

const PASTA = path.join(path.dirname(fileURLToPath(import.meta.url)), 'fotos-demo');
const BUCKET = 'anuncios';
export const PREFIXO_STORAGE = 'demo';

const IMAGENS = ['image/jpeg', 'image/png', 'image/webp'];
const BUCKETS = [
  { id: 'avatars', public: true, fileSizeLimit: '5MB', allowedMimeTypes: IMAGENS },
  { id: 'anuncios', public: true, fileSizeLimit: '10MB', allowedMimeTypes: IMAGENS },
  { id: 'documentos', public: false, fileSizeLimit: '10MB', allowedMimeTypes: [...IMAGENS, 'application/pdf'] },
];

/** Cria os buckets que faltarem (idempotente). */
export async function garantirBuckets() {
  const { data: existentes, error } = await supabaseAdmin.storage.listBuckets();
  if (error) throw error;
  for (const { id, ...opcoes } of BUCKETS) {
    if (existentes.some((b) => b.id === id)) continue;
    const { error: err } = await supabaseAdmin.storage.createBucket(id, opcoes);
    if (err) throw err;
    console.log(`  ✔ bucket ${id} criado (${opcoes.public ? 'público' : 'privado'})`);
  }
}

export async function aplicarFotosDemo() {
  await garantirBuckets();

  const anuncios = fs
    .readdirSync(PASTA, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);

  for (const mockId of anuncios) {
    const anuncioId = uuidDoMock(mockId);
    const { data: anuncio, error: errAnuncio } = await supabaseAdmin
      .from(T.anuncio)
      .select('id, titulo')
      .eq('id', anuncioId)
      .maybeSingle();
    if (errAnuncio) throw errAnuncio;
    if (!anuncio) {
      console.log(`  • ${mockId}: anúncio não está no banco (rode npm run seed) — ignorado`);
      continue;
    }

    const arquivos = fs.readdirSync(path.join(PASTA, mockId)).filter((f) => /\.(jpe?g|png|webp)$/i.test(f)).sort();
    const urls: string[] = [];
    for (const arquivo of arquivos) {
      const destino = `${PREFIXO_STORAGE}/${mockId}/${arquivo}`;
      const tipo = arquivo.endsWith('.png') ? 'image/png' : arquivo.endsWith('.webp') ? 'image/webp' : 'image/jpeg';
      const { error } = await supabaseAdmin.storage
        .from(BUCKET)
        .upload(destino, fs.readFileSync(path.join(PASTA, mockId, arquivo)), { contentType: tipo, upsert: true });
      if (error) throw new Error(`Falha ao enviar ${destino}: ${error.message}`);
      urls.push(supabaseAdmin.storage.from(BUCKET).getPublicUrl(destino).data.publicUrl);
    }

    const { error: errDel } = await supabaseAdmin.from(T.foto).delete().eq('anuncio_id', anuncioId);
    if (errDel) throw errDel;
    const { error: errIns } = await supabaseAdmin
      .from(T.foto)
      .insert(urls.map((url, i) => ({ id: novoId(), anuncio_id: anuncioId, url, ordem: i + 1 })));
    if (errIns) throw errIns;
    console.log(`  ✔ ${anuncio.titulo}: ${urls.length} fotos`);
  }
}

/** Remove as fotos de demonstração do Storage (usado por `npm run seed -- --limpar`). */
export async function removerFotosDemo() {
  const { data: buckets } = await supabaseAdmin.storage.listBuckets();
  if (!buckets?.some((b) => b.id === BUCKET)) return 0;
  let total = 0;
  const { data: pastas } = await supabaseAdmin.storage.from(BUCKET).list(PREFIXO_STORAGE);
  for (const pasta of pastas ?? []) {
    const { data: arquivos } = await supabaseAdmin.storage.from(BUCKET).list(`${PREFIXO_STORAGE}/${pasta.name}`);
    const caminhos = (arquivos ?? []).map((a) => `${PREFIXO_STORAGE}/${pasta.name}/${a.name}`);
    if (caminhos.length) {
      const { error } = await supabaseAdmin.storage.from(BUCKET).remove(caminhos);
      if (error) throw error;
      total += caminhos.length;
    }
  }
  return total;
}

// Execução direta: npm run seed:fotos
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  console.log('Aplicando fotos de demonstração…');
  aplicarFotosDemo().catch((err) => {
    console.error('\n❌', err instanceof Error ? err.message : err);
    process.exit(1);
  });
}
