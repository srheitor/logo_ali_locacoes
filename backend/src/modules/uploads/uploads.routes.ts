import { randomUUID } from 'node:crypto';
import { Router } from 'express';
import { z } from 'zod';
import { authenticate, currentUser } from '../../middlewares/auth.js';
import { forbidden } from '../../lib/errors.js';
import { supabaseAdmin } from '../../lib/supabase.js';
import { parse } from '../../lib/validation.js';
import type { TipoUsuario } from '../../types/domain.js';

/**
 * Upload direto para o Supabase Storage com URL assinada
 * (os buckets são criados uma vez com `npm run setup:storage`):
 * 1) o front chama `POST /uploads` e recebe `signedUrl` + `path`;
 * 2) envia o arquivo com `PUT signedUrl` (corpo = arquivo, header Content-Type);
 * 3) usa `public_url` (fotos/avatar) ou `path` (documento) no cadastro correspondente.
 * Assim o arquivo não passa pelo backend.
 */
export const uploadsRouter = Router();

uploadsRouter.use(authenticate());

const BUCKETS: Record<'anuncios' | 'documentos' | 'avatars', { perfis: TipoUsuario[]; publico: boolean }> = {
  anuncios: { perfis: ['PROPRIETARIO'], publico: true },
  documentos: { perfis: ['ESTUDANTE'], publico: false },
  avatars: { perfis: ['ESTUDANTE', 'PROPRIETARIO', 'ADMIN'], publico: true },
};

const uploadSchema = z.object({
  bucket: z.enum(['anuncios', 'documentos', 'avatars']),
  extensao: z
    .string()
    .trim()
    .toLowerCase()
    .transform((e) => e.replace(/^\./, ''))
    .pipe(z.enum(['jpg', 'jpeg', 'png', 'webp', 'pdf'])),
});

uploadsRouter.post('/', async (req, res) => {
  const user = currentUser(req);
  const { bucket, extensao } = parse(uploadSchema, req.body);
  const config = BUCKETS[bucket];
  if (!config.perfis.includes(user.tipo_usuario)) throw forbidden('Seu perfil não pode enviar arquivos para este destino.');

  // A pasta com o id do usuário permite validar a autoria depois (ex.: verificação de vínculo).
  const path = `${user.id}/${randomUUID()}.${extensao}`;
  const { data, error } = await supabaseAdmin.storage.from(bucket).createSignedUploadUrl(path);
  if (error) throw error;

  res.status(201).json({
    bucket,
    path: data.path,
    token: data.token,
    signed_url: data.signedUrl,
    public_url: config.publico ? supabaseAdmin.storage.from(bucket).getPublicUrl(data.path).data.publicUrl : null,
  });
});
