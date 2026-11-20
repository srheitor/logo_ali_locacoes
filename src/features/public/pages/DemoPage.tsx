import { ArrowLeft, ArrowRight, CheckCircle2, Database, Terminal } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Logo } from '@/shared/components/layout/Logo';

interface Requisito {
  numero: number;
  titulo: string;
  texto: string;
  to: string;
  acao: string;
  observacao?: string;
}

const requisitos: Requisito[] = [
  {
    numero: 1,
    titulo: 'Acesso ao sistema',
    texto: 'Entre com um dos perfis de demonstração — aluno, proprietário ou administrador.',
    to: '/login',
    acao: 'Abrir login',
  },
  {
    numero: 2,
    titulo: 'Execução de uma funcionalidade',
    texto: 'Busque imóveis, aplique filtros, troque a faculdade de referência e favorite um anúncio.',
    to: '/aluno',
    acao: 'Abrir a busca',
    observacao: 'Entre como aluno.',
  },
  {
    numero: 3,
    titulo: 'Inclusão de dados',
    texto: 'Cadastre um anúncio como proprietário ou agende uma visita e envie uma mensagem como aluno.',
    to: '/proprietario/anuncios/novo',
    acao: 'Cadastrar anúncio',
    observacao: 'Entre como proprietário.',
  },
  {
    numero: 4,
    titulo: 'Consulta dos dados',
    texto: 'Veja favoritos, visitas e os painéis com dados lidos do banco, não de telas estáticas.',
    to: '/aluno/favoritos',
    acao: 'Ver favoritos',
    observacao: 'Entre como aluno.',
  },
  {
    numero: 5,
    titulo: 'Alteração de dados',
    texto: 'Edite um anúncio, altere o status ou aprove um item na moderação do administrador.',
    to: '/proprietario/anuncios',
    acao: 'Editar anúncios',
    observacao: 'Entre como proprietário ou administrador.',
  },
  {
    numero: 6,
    titulo: 'Relacionamento entre informações',
    texto: 'No detalhe do anúncio aparecem proprietário, fotos, comodidades, regras, avaliações e visitas relacionadas.',
    to: '/aluno',
    acao: 'Abrir detalhe',
    observacao: 'Entre como aluno e abra um imóvel.',
  },
  {
    numero: 7,
    titulo: 'Execução de consulta SQL',
    texto: 'Execute uma das consultas da seção 16 no SQL Editor do Supabase e mostre o resultado real.',
    to: '',
    acao: '',
    observacao: 'As consultas estão documentadas no GitBook do projeto.',
  },
  {
    numero: 8,
    titulo: 'Visualização dos dados no banco',
    texto: 'Abra o Table Editor do Supabase e mostre as tabelas com as linhas gravadas pela aplicação.',
    to: '',
    acao: '',
  },
  {
    numero: 9,
    titulo: 'Integração entre aplicação e banco',
    texto: 'Faça uma inclusão no sistema, recarregue a tabela no banco e comprove que o registro foi persistido.',
    to: '',
    acao: '',
  },
];

export function DemoPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4 sm:px-8">
          <Link to="/" aria-label="Voltar para a página inicial">
            <Logo />
          </Link>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
          >
            <ArrowLeft size={16} /> Início
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-5 py-10 sm:px-8 lg:py-14">
        <p className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-brand-700">
          <Database size={14} /> Demonstração ao professor
        </p>
        <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">O que será apresentado</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
          Nove itens de avaliação, cada um com o caminho para a tela correspondente. A apresentação usa o banco
          efetivamente povoado — não serão mostradas apenas telas estáticas ou imagens do sistema.
        </p>

        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-slate-700">
            <Terminal size={16} className="text-brand-600" /> Antes de começar
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            O banco precisa estar povoado e a aplicação conectada à API:
          </p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <pre className="overflow-x-auto rounded-lg bg-slate-950 px-4 py-3 text-xs leading-6 text-slate-100">
              {'cd backend\nnpm install\nnpm run seed\nnpm run dev'}
            </pre>
            <pre className="overflow-x-auto rounded-lg bg-slate-950 px-4 py-3 text-xs leading-6 text-slate-100">
              {'# na raiz do projeto\nnpm run dev:api\n# front em modo API'}
            </pre>
          </div>
          <p className="mt-3 flex items-start gap-2 text-xs text-slate-500">
            <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-brand-600" />
            Usuários de demonstração: <code className="rounded bg-slate-100 px-1">aluno</code>,{' '}
            <code className="rounded bg-slate-100 px-1">proprietario</code> e{' '}
            <code className="rounded bg-slate-100 px-1">admin</code> — senha <code className="rounded bg-slate-100 px-1">123456</code>.
          </p>
        </section>

        <ol className="mt-8 grid gap-4 sm:grid-cols-2">
          {requisitos.map((requisito) => (
            <li
              key={requisito.numero}
              className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-brand-300 hover:shadow-sm"
            >
              <div className="flex items-start gap-3">
                <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white">
                  {String(requisito.numero).padStart(2, '0')}
                </span>
                <div className="min-w-0 flex-1">
                  <h2 className="text-base font-bold text-slate-900">{requisito.titulo}</h2>
                  <p className="mt-1 text-sm leading-6 text-slate-600">{requisito.texto}</p>
                  {requisito.observacao && (
                    <p className="mt-2 inline-flex rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-500">
                      {requisito.observacao}
                    </p>
                  )}
                </div>
              </div>
              {requisito.to && (
                <Link
                  to={requisito.to}
                  className="mt-4 inline-flex items-center gap-1.5 self-start text-sm font-semibold text-brand-700 transition hover:text-brand-800"
                >
                  {requisito.acao} <ArrowRight size={15} />
                </Link>
              )}
            </li>
          ))}
        </ol>
      </div>
    </main>
  );
}
