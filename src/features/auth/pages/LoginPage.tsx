import { useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Building2, GraduationCap, MapPinned, ShieldCheck, User } from 'lucide-react';
import { DEMO_SENHA } from '@/mocks';
import { PasswordInput, TextInput } from '@/shared/components/form';
import { Logo } from '@/shared/components/layout/Logo';
import { Button } from '@/shared/components/ui';
import { homeByRole, useAuth } from '../AuthProvider';

const demoUsers = [
  { login: 'aluno', label: 'Aluno', desc: 'Ana Beatriz · UFJF', icon: <GraduationCap size={20} />, color: 'text-brand-600 bg-brand-50' },
  { login: 'proprietario', label: 'Proprietário', desc: 'Carlos Eduardo', icon: <Building2 size={20} />, color: 'text-amber-600 bg-amber-50' },
  { login: 'admin', label: 'Admin', desc: 'Mariana Costa', icon: <ShieldCheck size={20} />, color: 'text-violet-600 bg-violet-50' },
];

export function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState<string>();

  if (user) return <Navigate to={homeByRole[user.tipo_usuario]} replace />;

  const doLogin = (l: string, s: string) => {
    const result = login(l, s);
    if (!result.ok) return setError(result.error);
    navigate(homeByRole[result.user.tipo_usuario]);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    doLogin(usuario, senha);
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Painel institucional */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-brand-700 via-brand-600 to-brand-800 p-12 text-white lg:flex">
        <Logo light />
        <div className="relative z-10 max-w-md">
          <h1 className="text-4xl font-bold leading-tight">Sua moradia perto da faculdade, sem complicação.</h1>
          <p className="mt-4 text-brand-100">
            Encontre quartos, kitnets e apartamentos próximos ao seu campus, converse direto com o proprietário e
            agende visitas — tudo em um só lugar.
          </p>
          <ul className="mt-8 space-y-3 text-sm text-brand-50">
            <li className="flex items-center gap-2"><MapPinned size={18} /> Distância e tempo até o campus em cada anúncio</li>
            <li className="flex items-center gap-2"><ShieldCheck size={18} /> Estudantes com vínculo verificado</li>
            <li className="flex items-center gap-2"><User size={18} /> Contato sem expor telefone ou e-mail</li>
          </ul>
        </div>
        <p className="text-xs text-brand-200">Projeto A3 · Banco de Dados · Análise e Desenvolvimento de Sistemas</p>
        <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-white/5" />
        <div className="absolute -right-10 top-20 h-56 w-56 rounded-full bg-accent-400/10" />
      </div>

      {/* Formulário */}
      <div className="flex items-center justify-center bg-slate-50 px-4 py-10 sm:px-8">
        <div className="w-full max-w-md">
          <Logo className="mb-8 lg:hidden" />
          <h2 className="text-2xl font-bold text-slate-900">Entrar</h2>
          <p className="mt-1 text-sm text-slate-500">Acesse com seu usuário ou e-mail.</p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <TextInput
              label="Usuário ou e-mail"
              value={usuario}
              onChange={setUsuario}
              placeholder="aluno, proprietario ou admin"
              leftIcon={<User size={16} />}
              autoComplete="username"
            />
            <PasswordInput value={senha} onChange={setSenha} autoComplete="current-password" />
            {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
            <Button type="submit" fullWidth size="lg">
              Entrar
            </Button>
          </form>

          <p className="mt-4 text-center text-sm text-slate-500">
            Ainda não tem conta?{' '}
            <Link to="/cadastro" className="font-medium text-brand-700 hover:underline">
              Cadastre-se
            </Link>
          </p>

          <div className="mt-8">
            <div className="mb-3 flex items-center gap-3 text-xs font-medium uppercase tracking-wide text-slate-400">
              <span className="h-px flex-1 bg-slate-200" /> Acesso rápido (demonstração) <span className="h-px flex-1 bg-slate-200" />
            </div>
            <div className="grid grid-cols-3 gap-2">
              {demoUsers.map((d) => (
                <button
                  key={d.login}
                  onClick={() => doLogin(d.login, DEMO_SENHA)}
                  className="flex flex-col items-center gap-2 rounded-xl border border-slate-200 bg-white p-3 text-center transition hover:border-brand-300 hover:shadow-sm"
                >
                  <span className={`rounded-lg p-2 ${d.color}`}>{d.icon}</span>
                  <span className="text-sm font-semibold text-slate-800">{d.label}</span>
                  <span className="text-[11px] leading-tight text-slate-500">{d.desc}</span>
                </button>
              ))}
            </div>
            <p className="mt-3 text-center text-xs text-slate-400">
              Senha de todos os usuários de teste: <code className="font-semibold text-slate-600">{DEMO_SENHA}</code>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
