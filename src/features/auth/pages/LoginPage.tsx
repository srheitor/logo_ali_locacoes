import { useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { ArrowRight, Building2, CheckCircle2, GraduationCap, MapPinned, ShieldCheck, Sparkles, User } from 'lucide-react';
import { FONTE_DADOS } from '@/app/providers/DataProvider';
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
  const [entrando, setEntrando] = useState(false);

  if (user) return <Navigate to={homeByRole[user.tipo_usuario]} replace />;

  const doLogin = async (l: string, s: string) => {
    setEntrando(true);
    const result = await login(l, s);
    setEntrando(false);
    if (!result.ok) return setError(result.error);
    navigate(homeByRole[result.user.tipo_usuario]);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    void doLogin(usuario, senha);
  };

  return (
    <div className="min-h-screen bg-slate-950 lg:grid lg:grid-cols-[1.08fr_0.92fr]">
      {/* Painel institucional */}
        <div className="relative hidden min-h-screen flex-col justify-between overflow-hidden bg-gradient-to-br from-slate-950 via-teal-950 to-brand-800 p-10 text-white lg:flex xl:p-14">
          <div className="absolute -left-24 top-1/3 h-72 w-72 rounded-full bg-brand-400/10 blur-3xl" />
          <div className="absolute -bottom-32 right-0 h-[28rem] w-[28rem] rounded-full bg-accent-400/10 blur-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_20%,rgba(45,212,191,0.18),transparent_30%)]" />

          <div className="relative z-10 flex items-center justify-between">
            <Logo light />
            <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-medium text-teal-100 backdrop-blur">
              Morar bem começa aqui
            </span>
          </div>

          <div className="relative z-10 max-w-xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-teal-300/20 bg-teal-300/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-teal-100">
              <Sparkles size={14} /> Feito para a vida universitária
            </div>
            <h1 className="max-w-lg text-5xl font-bold leading-[1.08] tracking-tight xl:text-6xl">
              O lugar certo para chamar de <span className="text-accent-300">casa.</span>
            </h1>
            <p className="mt-6 max-w-lg text-base leading-7 text-slate-300">
              Encontre quartos, kitnets e apartamentos próximos ao seu campus, com informações confiáveis e contato
              direto com quem anuncia.
          </p>
            <div className="mt-9 grid max-w-lg grid-cols-3 gap-3">
              {[
                ['+120', 'imóveis cadastrados'],
                ['4,9/5', 'avaliação média'],
                ['24h', 'para encontrar seu espaço'],
              ].map(([value, label]) => (
                <div key={label} className="border-l border-white/20 pl-3">
                  <p className="text-xl font-bold text-white">{value}</p>
                  <p className="mt-1 text-[11px] leading-4 text-slate-400">{label}</p>
                </div>
              ))}
            </div>
            <ul className="mt-8 grid gap-3 text-sm text-teal-50 sm:grid-cols-3 lg:grid-cols-1">
              <li className="flex items-center gap-2"><MapPinned size={18} /> Distância até o campus</li>
              <li className="flex items-center gap-2"><ShieldCheck size={18} /> Estudantes verificados</li>
              <li className="flex items-center gap-2"><User size={18} /> Contato protegido</li>
            </ul>
        </div>

          <div className="relative z-10 flex items-center justify-between gap-6 border-t border-white/10 pt-5 text-xs text-slate-400">
            <span>Projeto A3 · Banco de Dados · ADS</span>
            <span className="flex items-center gap-1.5 text-teal-200"><CheckCircle2 size={14} /> Ambiente seguro</span>
          </div>
      </div>

      {/* Formulário */}
        <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10 sm:px-8">
        <div className="w-full max-w-md">
            <div className="mb-8 lg:hidden">
              <Logo />
              <p className="mt-3 text-sm text-slate-500">Morar bem começa aqui.</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_24px_70px_-30px_rgba(15,23,42,0.35)] sm:p-9">
              <div className="mb-7">
                <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-brand-600">Bem-vindo de volta</p>
                <h2 className="text-3xl font-bold tracking-tight text-slate-950">Entre na sua conta</h2>
                <p className="mt-2 text-sm text-slate-500">Acesse com seu usuário ou e-mail para continuar.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
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
                <Button type="submit" fullWidth size="lg" disabled={entrando} icon={<ArrowRight size={17} />}>
                  {entrando ? 'Entrando…' : 'Entrar na plataforma'}
                </Button>
              </form>

              <p className="mt-5 text-center text-sm text-slate-500">
                Ainda não tem conta?{' '}
                <Link to="/cadastro" className="font-semibold text-brand-700 hover:text-brand-800 hover:underline">
                  Cadastre-se
                </Link>
              </p>

              <div className="mt-8 border-t border-slate-100 pt-6">
                <div className="mb-3 flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                  <span className="h-px flex-1 bg-slate-200" /> Acesso rápido <span className="h-px flex-1 bg-slate-200" />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {demoUsers.map((d) => (
                    <button
                      key={d.login}
                      onClick={() => void doLogin(d.login, DEMO_SENHA)}
                      disabled={entrando}
                      className="group flex flex-col items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50/70 p-3 text-center transition hover:-translate-y-0.5 hover:border-brand-300 hover:bg-white hover:shadow-md"
                    >
                      <span className={`rounded-xl p-2.5 transition group-hover:scale-105 ${d.color}`}>{d.icon}</span>
                      <span className="text-xs font-bold text-slate-800">{d.label}</span>
                      <span className="text-[10px] leading-tight text-slate-500">{d.desc}</span>
                    </button>
                  ))}
                </div>
                <p className="mt-4 text-center text-xs text-slate-400">
                  Senha de teste: <code className="rounded bg-slate-100 px-1.5 py-0.5 font-semibold text-slate-600">{DEMO_SENHA}</code>
                </p>
                {FONTE_DADOS === 'api' && (
                  <p className="mt-2 text-center text-xs text-amber-600">
                    Modo API: o acesso rápido usa os usuários criados por <code>npm run seed</code>.
                  </p>
                )}
            </div>
            </div>
            <p className="mt-5 flex items-center justify-center gap-1.5 text-xs text-slate-400"><ShieldCheck size={13} /> Seus dados ficam protegidos com a Logo Alí</p>
          </div>
        </div>
      </div>
  );
}
