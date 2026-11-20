/**
 * Fotos reais (domínio público/CC0 — ver public/imoveis/fotos/CREDITOS.md) para os anúncios de demonstração.
 *
 * O pool local fica em `public/imoveis/fotos/`: 20 conjuntos com 5 fotos cada.
 * O seed associa cada anúncio a um conjunto conforme o tipo de imóvel, envia cada conjunto
 * uma única vez ao bucket público "anuncios" (pasta demo/fotos/<conjunto>/) e substitui
 * as fotos do anúncio em FOTO_ANUNCIO pelas URLs públicas.
 *
 * Uso: npm run seed:fotos   (o `npm run seed` também chama este passo)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createSeed } from '@/mocks/index.ts';
import { conjuntoDoAnuncio, FOTOS_POR_CONJUNTO } from '@/mocks/fotos.ts';
import { novoId, supabaseAdmin, T } from '../src/lib/supabase.ts';
import { uuidDoMock } from './ids.ts';

const PASTA = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../public/imoveis/fotos');
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

/** Envia um conjunto de fotos ao Storage (idempotente) e devolve as URLs públicas em ordem. */
async function enviarConjunto(conjunto: string) {
  const pasta = path.join(PASTA, conjunto);
  if (!fs.existsSync(pasta)) throw new Error(`Conjunto de fotos não encontrado: ${pasta}`);

  const urls: string[] = [];
  for (let ordem = 1; ordem <= FOTOS_POR_CONJUNTO; ordem++) {
    const arquivo = `${String(ordem).padStart(2, '0')}.webp`;
    const origem = path.join(pasta, arquivo);
    if (!fs.existsSync(origem)) throw new Error(`Foto ausente: ${conjunto}/${arquivo}`);
    const destino = `${PREFIXO_STORAGE}/fotos/${conjunto}/${arquivo}`;
    const { error } = await supabaseAdmin.storage
      .from(BUCKET)
      .upload(destino, fs.readFileSync(origem), { contentType: 'image/webp', upsert: true });
    if (error) throw new Error(`Falha ao enviar ${destino}: ${error.message}`);
    urls.push(supabaseAdmin.storage.from(BUCKET).getPublicUrl(destino).data.publicUrl);
  }
  return urls;
}

export async function aplicarFotosDemo() {
  await garantirBuckets();

  const db = createSeed();
  const porConjunto = new Map<string, string[]>();
  for (const anuncio of db.anuncios) {
    const conjunto = conjuntoDoAnuncio(anuncio.id, anuncio.tipo_imovel);
    if (!porConjunto.has(conjunto)) porConjunto.set(conjunto, []);
  }

  console.log(`  ↑ enviando ${porConjunto.size} conjuntos de fotos ao Storage…`);
  for (const conjunto of porConjunto.keys()) {
    porConjunto.set(conjunto, await enviarConjunto(conjunto));
  }

  const ids = db.anuncios.map((a) => uuidDoMock(a.id));
  const { data: existentes, error } = await supabaseAdmin.from(T.anuncio).select('id, titulo').in('id', ids);
  if (error) throw error;
  const encontrados = new Map((existentes ?? []).map((a) => [a.id as string, a.titulo as string]));

  for (const anuncio of db.anuncios) {
    const anuncioId = uuidDoMock(anuncio.id);
    const titulo = encontrados.get(anuncioId);
    if (!titulo) continue; // anúncio não está no banco (rode npm run seed antes)
    const urls = porConjunto.get(conjuntoDoAnuncio(anuncio.id, anuncio.tipo_imovel))!;

    const { error: errDel } = await supabaseAdmin.from(T.foto).delete().eq('anuncio_id', anuncioId);
    if (errDel) throw errDel;
    const { error: errIns } = await supabaseAdmin
      .from(T.foto)
      .insert(urls.map((url, i) => ({ id: novoId(), anuncio_id: anuncioId, url, ordem: i + 1 })));
    if (errIns) throw errIns;
    console.log(`  ✔ ${titulo}: ${urls.length} fotos`);
  }
}

/** Remove recursivamente os arquivos de demonstração do Storage. */
async function removerRecursivo(prefixo: string): Promise<number> {
  const { data, error } = await supabaseAdmin.storage.from(BUCKET).list(prefixo);
  if (error) throw error;
  let total = 0;
  const arquivos: string[] = [];
  for (const item of data ?? []) {
    const caminho = `${prefixo}/${item.name}`;
    if (item.id === null) {
      total += await removerRecursivo(caminho);
    } else {
      arquivos.push(caminho);
    }
  }
  if (arquivos.length) {
    const { error: err } = await supabaseAdmin.storage.from(BUCKET).remove(arquivos);
    if (err) throw err;
    total += arquivos.length;
  }
  return total;
}

/** Remove as fotos de demonstração do Storage (usado por `npm run seed -- --limpar`). */
export async function removerFotosDemo() {
  const { data: buckets } = await supabaseAdmin.storage.listBuckets();
  if (!buckets?.some((b) => b.id === BUCKET)) return 0;
  return removerRecursivo(PREFIXO_STORAGE);
}

// Execução direta: npm run seed:fotos
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  console.log('Aplicando fotos de demonstração…');
  aplicarFotosDemo().catch((err) => {
    console.error('\n❌', err instanceof Error ? err.message : err);
    process.exit(1);
  });
}
