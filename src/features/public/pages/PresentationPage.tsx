import {
  ArrowRight,
  CalendarCheck,
  CheckCircle2,
  GraduationCap,
  Home,
  MapPin,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Logo } from '@/shared/components/layout/Logo';

const highlights = [
  { icon: <MapPin size={20} />, title: 'Perto do seu campus', text: 'Compare distância e tempo de deslocamento antes de visitar.' },
  { icon: <ShieldCheck size={20} />, title: 'Mais segurança', text: 'Informações organizadas e estudantes com vínculo verificado.' },
  { icon: <Home size={20} />, title: 'Seu novo espaço', text: 'Quartos, kitnets e apartamentos para cada fase da sua jornada.' },
];

const steps = [
  { icon: <Search size={20} />, title: 'Busque pelo campus', text: 'Informe sua faculdade e veja as moradias que ficam por perto.' },
  { icon: <MapPin size={20} />, title: 'Compare distância e preço', text: 'Veja tempo de deslocamento, fotos, valores e comodidades.' },
  { icon: <CalendarCheck size={20} />, title: 'Agende a visita', text: 'Fale direto com o proprietário e combine o melhor horário.' },
];

const ctaFocus =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950';

export function PresentationPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-slate-950 text-white">
      <section className="relative isolate">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_80%_10%,rgba(45,212,191,0.2),transparent_30%),linear-gradient(135deg,#020617_0%,#073b3a_55%,#0f766e_100%)]" />
        <div className="absolute -bottom-48 -left-24 -z-10 h-[30rem] w-[30rem] rounded-full bg-teal-400/10 blur-3xl" />

        <nav className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-5 py-4 sm:px-6 sm:py-6 lg:px-8">
          <Logo light />
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/login"
              className={`hidden min-h-11 items-center rounded-full px-3 text-sm font-semibold text-slate-200 transition hover:bg-white/10 hover:text-white min-[380px]:inline-flex sm:px-4 ${ctaFocus}`}
            >
              Entrar
            </Link>
            <Link
              to="/cadastro"
              className={`inline-flex min-h-11 items-center rounded-full bg-white px-4 text-sm font-semibold text-teal-800 shadow-lg shadow-slate-950/10 transition hover:bg-teal-50 ${ctaFocus}`}
            >
              Criar conta
            </Link>
          </div>
        </nav>

        <div className="mx-auto grid max-w-7xl items-center gap-8 px-5 pb-14 pt-8 sm:gap-12 sm:px-6 sm:pt-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:px-8 lg:pb-20 lg:pt-20">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-teal-200/20 bg-teal-200/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-teal-100">
              <Sparkles size={14} aria-hidden /> Morar bem começa aqui
            </div>
            <h1 className="max-w-3xl text-[clamp(2rem,9vw,3rem)] font-bold leading-[1.08] tracking-tight sm:text-6xl sm:leading-[1.05] lg:text-7xl">
              Encontre um lugar para viver sua <span className="text-amber-300">melhor fase.</span>
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-slate-300 sm:mt-7 sm:text-lg sm:leading-8">
              A Logo Alí conecta estudantes a moradias próximas da faculdade, com praticidade, transparência e contato direto com proprietários.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:mt-9 sm:flex-row">
              <Link
                to="/login"
                className={`inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-teal-400 px-6 font-bold text-slate-950 transition hover:bg-teal-300 sm:w-auto ${ctaFocus}`}
              >
                Encontrar moradia <ArrowRight size={18} aria-hidden />
              </Link>
              <Link
                to="/cadastro"
                className={`inline-flex min-h-12 w-full items-center justify-center rounded-xl border border-white/20 px-6 font-semibold text-white transition hover:bg-white/10 sm:w-auto ${ctaFocus}`}
              >
                Quero anunciar um imóvel
              </Link>
            </div>
            <div className="mt-6 flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-300 sm:mt-8 sm:gap-x-6 sm:text-sm">
              {['Busca por campus', 'Visitas agendadas', 'Contato protegido'].map((item) => (
                <span key={item} className="inline-flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-teal-300" aria-hidden /> {item}
                </span>
              ))}
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-md">
            <div className="absolute -inset-5 rounded-[2rem] bg-teal-300/10 blur-2xl" />
            <div className="relative overflow-hidden rounded-[2rem] border border-white/15 bg-white/10 p-3 shadow-2xl backdrop-blur-xl sm:p-4">
              <div className="rounded-[1.5rem] bg-slate-900/80 p-4 sm:p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-teal-200">Sugestão para você</p>
                    <p className="mt-1 text-base font-bold sm:text-lg">Moradias perto da UFJF</p>
                  </div>
                  <span className="rounded-full bg-teal-400/15 p-2.5 text-teal-300 sm:p-3"><GraduationCap size={22} aria-hidden /></span>
                </div>
                <div className="mt-4 h-36 rounded-2xl bg-[radial-gradient(circle_at_30%_40%,rgba(45,212,191,0.38),transparent_2%),radial-gradient(circle_at_70%_65%,rgba(251,191,36,0.45),transparent_2%),linear-gradient(135deg,#134e4a,#164e63)] bg-[length:58px_58px,82px_82px,100%_100%] sm:mt-5 sm:h-44">
                  <div className="flex h-full items-center justify-center">
                    <div className="rounded-full border-4 border-white bg-teal-500 p-3 shadow-xl"><MapPin size={23} aria-hidden /></div>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between rounded-xl bg-white/10 p-3 sm:mt-4">
                  <div>
                    <p className="text-sm font-semibold">Kitnet mobiliada</p>
                    <p className="mt-1 text-xs text-slate-400">A 8 min do campus · Disponível já</p>
                  </div>
                  <p className="shrink-0 pl-3 text-sm font-bold text-amber-300">R$ 850/mês</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Prova social */}
        <div className="mx-auto max-w-7xl px-5 pb-14 sm:px-6 lg:px-8 lg:pb-20">
          <div className="grid grid-cols-3 divide-x divide-white/10 rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-5">
            <div className="flex flex-col items-center px-1 text-center">
              <span className="inline-flex items-center gap-1 text-lg font-bold sm:text-xl">
                <Star size={16} className="text-amber-300" aria-hidden /> 4.8
              </span>
              <span className="mt-1 text-[11px] leading-tight text-slate-300 sm:text-xs">avaliação média</span>
            </div>
            <div className="flex flex-col items-center px-1 text-center">
              <span className="inline-flex items-center gap-1 text-lg font-bold sm:text-xl">
                <Users size={16} className="text-teal-300" aria-hidden /> +500
              </span>
              <span className="mt-1 text-[11px] leading-tight text-slate-300 sm:text-xs">estudantes</span>
            </div>
            <div className="flex flex-col items-center px-1 text-center">
              <span className="inline-flex items-center gap-1 text-lg font-bold sm:text-xl">
                <Home size={16} className="text-teal-300" aria-hidden /> +120
              </span>
              <span className="mt-1 text-[11px] leading-tight text-slate-300 sm:text-xs">imóveis listados</span>
            </div>
          </div>
        </div>
      </section>

      {/* Como funciona */}
      <section className="bg-slate-50 px-5 py-14 text-slate-900 sm:px-6 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-xl">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-700">Simples do começo ao fim</p>
            <h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">Como funciona</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600 sm:text-base">Três passos entre você e a sua nova moradia.</p>
          </div>
          <div className="mt-8 grid gap-3 sm:grid-cols-3 sm:gap-5">
            {steps.map((step, index) => (
              <article key={step.title} className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 sm:flex-col sm:gap-0 sm:p-6">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-100 text-teal-700">
                  {step.icon}
                </span>
                <div className="min-w-0 sm:mt-4">
                  <h3 className="text-base font-bold sm:text-lg">
                    <span className="text-teal-700">0{index + 1}.</span> {step.title}
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-slate-500">{step.text}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Benefícios */}
      <section className="bg-white px-5 py-14 text-slate-900 sm:px-6 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-xl">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-700">Tudo mais simples</p>
            <h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">Uma experiência pensada para você</h2>
          </div>
          <div className="mt-8 grid gap-3 sm:mt-10 sm:gap-4 md:grid-cols-3">
            {highlights.map((highlight) => (
              <article key={highlight.title} className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-5 sm:block sm:p-6">
                <span className="inline-flex shrink-0 rounded-xl bg-teal-100 p-3 text-teal-700">{highlight.icon}</span>
                <div className="min-w-0 sm:mt-0">
                  <h3 className="text-base font-bold sm:mt-5 sm:text-lg">{highlight.title}</h3>
                  <p className="mt-1 text-sm leading-6 text-slate-500 sm:mt-2">{highlight.text}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="relative isolate overflow-hidden bg-slate-950 px-5 py-16 text-white sm:px-6 lg:px-8 lg:py-20">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_0%,rgba(45,212,191,0.25),transparent_45%),linear-gradient(135deg,#020617_0%,#073b3a_60%,#0f766e_100%)]" />
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">Pronto para encontrar seu novo lar?</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-300 sm:text-base">
            Crie sua conta gratuitamente e veja moradias perto do seu campus.
          </p>
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              to="/cadastro"
              className={`inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-teal-400 px-6 font-bold text-slate-950 transition hover:bg-teal-300 sm:w-auto ${ctaFocus}`}
            >
              Criar conta grátis <ArrowRight size={18} aria-hidden />
            </Link>
            <Link
              to="/login"
              className={`inline-flex min-h-12 w-full items-center justify-center rounded-xl border border-white/20 px-6 font-semibold text-white transition hover:bg-white/10 sm:w-auto ${ctaFocus}`}
            >
              Já tenho conta
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
