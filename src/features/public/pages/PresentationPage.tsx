import { ArrowRight, CheckCircle2, GraduationCap, Home, MapPin, ShieldCheck, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Logo } from '@/shared/components/layout/Logo';

const highlights = [
  { icon: <MapPin size={20} />, title: 'Perto do seu campus', text: 'Compare distância e tempo de deslocamento antes de visitar.' },
  { icon: <ShieldCheck size={20} />, title: 'Mais segurança', text: 'Informações organizadas e estudantes com vínculo verificado.' },
  { icon: <Home size={20} />, title: 'Seu novo espaço', text: 'Quartos, kitnets e apartamentos para cada fase da sua jornada.' },
];

export function PresentationPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-slate-950 text-white">
      <section className="relative isolate">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_80%_10%,rgba(45,212,191,0.2),transparent_30%),linear-gradient(135deg,#020617_0%,#073b3a_55%,#0f766e_100%)]" />
        <div className="absolute -bottom-48 -left-24 -z-10 h-[30rem] w-[30rem] rounded-full bg-teal-400/10 blur-3xl" />

        <nav className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-slate-950/75 backdrop-blur-xl">
          <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">
            <Logo light />
            <div className="flex items-center gap-2 sm:gap-3">
              <Link to="/login" className="rounded-full px-3 py-2 text-sm font-semibold text-slate-200 transition hover:bg-white/10 hover:text-white sm:px-4">
                Entrar
              </Link>
              <Link to="/cadastro" className="rounded-full bg-white px-3 py-2 text-sm font-semibold text-teal-800 shadow-lg shadow-slate-950/10 transition hover:bg-teal-50 sm:px-4">
                Criar conta
              </Link>
            </div>
          </div>
        </nav>

        <div className="mx-auto grid max-w-7xl items-center gap-16 px-6 pb-20 pt-28 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:pb-28 lg:pt-32">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-teal-200/20 bg-teal-200/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-teal-100">
              <Sparkles size={14} /> Morar bem começa aqui
            </div>
            <h1 className="max-w-3xl text-5xl font-bold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
              Encontre um lugar para viver sua <span className="text-amber-300">melhor fase.</span>
            </h1>
            <p className="mt-7 max-w-xl text-lg leading-8 text-slate-300">
              A Logo Alí conecta estudantes a moradias próximas da faculdade, com praticidade, transparência e contato direto com proprietários.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link to="/login" className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-teal-400 px-6 font-bold text-slate-950 transition hover:bg-teal-300">
                Encontrar moradia <ArrowRight size={18} />
              </Link>
              <Link to="/cadastro" className="inline-flex h-12 items-center justify-center rounded-xl border border-white/20 px-6 font-semibold text-white transition hover:bg-white/10">
                Quero anunciar um imóvel
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-300">
              {['Busca por campus', 'Visitas agendadas', 'Contato protegido'].map((item) => (
                <span key={item} className="inline-flex items-center gap-2"><CheckCircle2 size={16} className="text-teal-300" /> {item}</span>
              ))}
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-md">
            <div className="absolute -inset-5 rounded-[2rem] bg-teal-300/10 blur-2xl" />
            <div className="relative overflow-hidden rounded-[2rem] border border-white/15 bg-white/10 p-4 shadow-2xl backdrop-blur-xl">
              <div className="rounded-[1.5rem] bg-slate-900/80 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-teal-200">Sugestão para você</p>
                    <p className="mt-1 text-lg font-bold">Moradias perto da UFJF</p>
                  </div>
                  <span className="rounded-full bg-teal-400/15 p-3 text-teal-300"><GraduationCap size={22} /></span>
                </div>
                <div className="mt-5 h-44 rounded-2xl bg-[radial-gradient(circle_at_30%_40%,rgba(45,212,191,0.38),transparent_2%),radial-gradient(circle_at_70%_65%,rgba(251,191,36,0.45),transparent_2%),linear-gradient(135deg,#134e4a,#164e63)] bg-[length:58px_58px,82px_82px,100%_100%]">
                  <div className="flex h-full items-center justify-center">
                    <div className="rounded-full border-4 border-white bg-teal-500 p-3 shadow-xl"><MapPin size={23} /></div>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between rounded-xl bg-white/10 p-3">
                  <div>
                    <p className="text-sm font-semibold">Kitnet mobiliada</p>
                    <p className="mt-1 text-xs text-slate-400">A 8 min do campus · Disponível já</p>
                  </div>
                  <p className="text-sm font-bold text-amber-300">R$ 850/mês</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white px-6 py-16 text-slate-900 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-xl">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-700">Tudo mais simples</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Uma experiência pensada para você</h2>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {highlights.map((highlight) => (
              <article key={highlight.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
                <span className="inline-flex rounded-xl bg-teal-100 p-3 text-teal-700">{highlight.icon}</span>
                <h3 className="mt-5 text-lg font-bold">{highlight.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">{highlight.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
