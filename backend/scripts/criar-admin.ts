/**
 * Cria um usuário ADMINISTRADOR (a rota pública de cadastro só aceita estudante e proprietário).
 *
 * Uso:
 *   npm run criar-admin -- --email admin@exemplo.com --nome "Fulano" [--senha "minhaSenha"]
 * Sem --senha, uma senha aleatória é gerada e exibida uma única vez.
 */
import { randomBytes } from 'node:crypto';
import { parseArgs } from 'node:util';
import bcrypt from 'bcryptjs';
import { agora, novoId, supabaseAdmin, T } from '../src/lib/supabase.ts';

const { values } = parseArgs({
  options: {
    email: { type: 'string' },
    nome: { type: 'string', default: 'Administrador' },
    senha: { type: 'string' },
  },
});

const email = values.email?.trim().toLowerCase();
if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
  console.error('Informe um e-mail válido: npm run criar-admin -- --email admin@exemplo.com');
  process.exit(1);
}
const senha = values.senha ?? randomBytes(9).toString('base64url');
if (senha.length < 6) {
  console.error('A senha deve ter no mínimo 6 caracteres.');
  process.exit(1);
}

const { data: existente, error: erroBusca } = await supabaseAdmin.from(T.usuario).select('id').eq('email', email).maybeSingle();
if (erroBusca) throw erroBusca;
if (existente) {
  console.error(`Já existe um usuário com o e-mail ${email}.`);
  process.exit(1);
}

const id = novoId();
const criadoEm = agora();
const { error } = await supabaseAdmin.from(T.usuario).insert({
  id,
  nome: values.nome,
  email,
  senha_hash: await bcrypt.hash(senha, 10),
  tipo_usuario: 'ADMIN',
  ativo: true,
  criado_em: criadoEm,
  atualizado_em: criadoEm,
});
if (error) throw error;

console.log('✔ Administrador criado');
console.log(`  id:    ${id}`);
console.log(`  email: ${email}`);
if (!values.senha) console.log(`  senha: ${senha}   (gerada agora — guarde-a, ela não será exibida de novo)`);
