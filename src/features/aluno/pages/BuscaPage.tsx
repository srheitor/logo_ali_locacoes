import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowUpDown,
  ChevronDown,
  Columns2,
  LayoutList,
  Map as MapIcon,
  SearchX,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { useData } from '@/app/providers/DataProvider';
import { filtrosIniciais, filtrarAnuncios, ordens, type FiltrosBusca, type Ordem } from '@/features/anuncios/filtros';
import { AnuncioCard } from '@/features/anuncios/components/AnuncioCard';
import { AnuncioMiniCard } from '@/features/anuncios/components/AnuncioMiniCard';
import { AnunciosMap } from '@/features/anuncios/components/AnunciosMap';
import { FiltrosSheet } from '@/features/anuncios/components/FiltrosSheet';
import { RotaInfo } from '@/features/anuncios/components/RotaInfo';
import { SeletorFaculdade } from '@/features/anuncios/components/SeletorFaculdade';
import { SeletorLocalidade } from '@/features/anuncios/components/SeletorLocalidade';
import { useRotaAteCampus } from '@/features/anuncios/useRotaAteCampus';
import {
  anunciosPublicos,
  capaDoAnuncio,
  fotosDoAnuncio,
  getCampusDaInstituicao,
  isFavorito,
  nomeCampus,
} from '@/services/queries';
import { useToast } from '@/shared/components/feedback/Toast';
import { Button, EmptyState, PageHeader } from '@/shared/components/ui';
import { cn, formatCurrency, parseCurrency, tipoImovelLabel } from '@/shared/utils';
import { useEstudanteAtual } from '../useEstudanteAtual';

type View = 'lista' | 'mapa' | 'ambos';

const FILTROS_KEY = 'logoali:busca:filtros';

/** Mantém os filtros ao voltar da página do anúncio (mesma aba). */
function filtrosSalvos(): FiltrosBusca {
  try {
    const raw = sessionStorage.getItem(FILTROS_KEY);
    if (!raw) return filtrosIniciais;
    const salvos = JSON.parse(raw) as Partial<FiltrosBusca>;
    return {
      ...filtrosIniciais,
      ...salvos,
      comodidades: Array.isArray(salvos.comodidades) ? salvos.comodidades : [],
      cidade: salvos.cidade || filtrosIniciais.cidade,
      estado: salvos.estado || filtrosIniciais.estado,
    };
  } catch {
    return filtrosIniciais;
  }
}

/** RF05 + RF06 — busca com filtros, em lista e no mapa. */
export function BuscaPage() {
  const { db, acoes } = useData();
  const toast = useToast();
  const { user, estudante, campus, campusLabel } = useEstudanteAtual();
  const [searchParams, setSearchParams] = useSearchParams();
  const [filtros, setFiltros] = useState<FiltrosBusca>(() => {
    const salvos = filtrosSalvos();
    const faculdade = searchParams.get('faculdade');
    const cidade = searchParams.get('cidade');
    const estado = searchParams.get('estado');
    return {
      ...salvos,
      ...(faculdade ? { instituicao: faculdade } : {}),
      ...(cidade ? { cidade } : {}),
      ...(estado ? { estado } : {}),
    };
  });
  const [rascunho, setRascunho] = useState<FiltrosBusca>(filtros);
  const [view, setView] = useState<View>('ambos');
  const [selectedId, setSelectedId] = useState<string>();
  const [showFilters, setShowFilters] = useState(false);
  const carrosselRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<Record<string, HTMLDivElement | null>>({});
  const scrollTimer = useRef<number>();

  useEffect(() => {
    try {
      sessionStorage.setItem(FILTROS_KEY, JSON.stringify(filtros));
    } catch {
      /* storage indisponível */
    }
  }, [filtros]);

  // Faculdade e localidade ficam na URL: a seleção sobrevive à navegação e é compartilhável.
  useEffect(() => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        const pares: Array<[string, string]> = [
          ['faculdade', filtros.instituicao],
          ['cidade', filtros.cidade],
          ['estado', filtros.estado],
        ];
        for (const [chave, valor] of pares) {
          if (valor) next.set(chave, valor);
          else next.delete(chave);
        }
        return next;
      },
      { replace: true },
    );
  }, [filtros.instituicao, filtros.cidade, filtros.estado, setSearchParams]);

  const campusId = estudante?.campus_id;
  const instituicaoSelecionada = filtros.instituicao
    ? db.instituicoes.find((i) => i.id === filtros.instituicao)
    : undefined;
  const campusSelecionado = instituicaoSelecionada ? getCampusDaInstituicao(db, instituicaoSelecionada.id) : undefined;
  const campusReferencia = campusSelecionado ?? campus;
  const campusReferenciaLabel = campusSelecionado ? nomeCampus(db, campusSelecionado.id) : campusLabel;
  const minhaInstituicaoId = campus?.instituicao_id;
  const queryFaculdade = filtros.instituicao ? `?faculdade=${encodeURIComponent(filtros.instituicao)}` : '';
  const linkAnuncio = (anuncioId: string) => `/aluno/anuncios/${anuncioId}${queryFaculdade}`;
  const resultados = useMemo(() => filtrarAnuncios(db, campusId, filtros), [db, campusId, filtros]);
  const totalRascunho = useMemo(() => filtrarAnuncios(db, campusId, rascunho).length, [db, campusId, rascunho]);
  const bairros = useMemo(
    () => Array.from(new Set(anunciosPublicos(db).map((a) => a.bairro))).sort((a, b) => a.localeCompare(b, 'pt-BR')),
    [db],
  );

  const patchRascunho = (patch: Partial<FiltrosBusca>) => setRascunho((f) => ({ ...f, ...patch }));
  const patchAplicado = (patch: Partial<FiltrosBusca>) => {
    setFiltros((f) => ({ ...f, ...patch }));
    setRascunho((f) => ({ ...f, ...patch }));
  };

  const escolherFaculdade = (id: string) =>
    patchAplicado({ instituicao: id, distanciaMax: id ? filtros.distanciaMax || '2' : '' });

  const abrirFiltros = () => {
    setRascunho(filtros);
    setShowFilters(true);
  };
  const aplicarFiltros = () => {
    setFiltros(rascunho);
    setShowFilters(false);
  };
  const limparRascunho = () => setRascunho({ ...filtrosIniciais, ordem: rascunho.ordem });
  const limparTudo = () => {
    const limpos = { ...filtrosIniciais, ordem: filtros.ordem };
    setFiltros(limpos);
    setRascunho(limpos);
  };

  const ativos = [
    !!filtros.instituicao,
    !!(filtros.precoMin || filtros.precoMax),
    !!filtros.tipo,
    !!filtros.quartosMin,
    !!filtros.bairro,
    !!filtros.distanciaMax,
    !!filtros.avaliacaoMin,
    filtros.mobiliado,
    filtros.imediato,
    filtros.comodidades.length > 0,
  ].filter(Boolean).length;

  const chips: Array<{ key: string; label: string; remover: () => void }> = [];
  if (instituicaoSelecionada) {
    chips.push({
      key: 'instituicao',
      label: instituicaoSelecionada.sigla,
      remover: () => patchAplicado({ instituicao: '', distanciaMax: '' }),
    });
  }
  const precoMin = parseCurrency(filtros.precoMin);
  const precoMax = parseCurrency(filtros.precoMax);
  if (precoMin || precoMax) {
    chips.push({
      key: 'preco',
      label: precoMin && precoMax
        ? `${formatCurrency(precoMin)} – ${formatCurrency(precoMax)}`
        : precoMin
          ? `Acima de ${formatCurrency(precoMin)}`
          : `Até ${formatCurrency(precoMax)}`,
      remover: () => patchAplicado({ precoMin: '', precoMax: '' }),
    });
  }
  if (filtros.tipo) chips.push({ key: 'tipo', label: tipoImovelLabel[filtros.tipo], remover: () => patchAplicado({ tipo: '' }) });
  if (filtros.quartosMin) chips.push({ key: 'quartos', label: `${filtros.quartosMin}+ quartos`, remover: () => patchAplicado({ quartosMin: '' }) });
  if (filtros.bairro) chips.push({ key: 'bairro', label: filtros.bairro, remover: () => patchAplicado({ bairro: '' }) });
  if (filtros.distanciaMax) chips.push({ key: 'distancia', label: `Até ${filtros.distanciaMax.replace('.', ',')} km`, remover: () => patchAplicado({ distanciaMax: '' }) });
  if (filtros.avaliacaoMin) chips.push({ key: 'avaliacao', label: `Nota ${filtros.avaliacaoMin.replace('.', ',')}+`, remover: () => patchAplicado({ avaliacaoMin: '' }) });
  if (filtros.mobiliado) chips.push({ key: 'mobiliado', label: 'Mobiliado', remover: () => patchAplicado({ mobiliado: false }) });
  if (filtros.imediato) chips.push({ key: 'imediato', label: 'Disponível já', remover: () => patchAplicado({ imediato: false }) });
  for (const id of filtros.comodidades) {
    const nome = db.comodidades.find((c) => c.id === id)?.nome ?? id;
    chips.push({
      key: `com-${id}`,
      label: nome,
      remover: () => patchAplicado({ comodidades: filtros.comodidades.filter((c) => c !== id) }),
    });
  }

  const chipsAtivos = chips.length > 0 && (
    <div className="no-scrollbar flex gap-1.5 overflow-x-auto lg:flex-wrap lg:overflow-visible">
      {chips.map((chip) => (
        <button
          key={chip.key}
          onClick={chip.remover}
          className="inline-flex shrink-0 items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-800"
        >
          {chip.label} <X size={12} />
        </button>
      ))}
    </div>
  );

  // Rota pelas ruas do anúncio selecionado até o campus (espera o mouse parar para consultar o OSRM).
  const selecionado = resultados.find((r) => r.anuncio.id === selectedId)?.anuncio;
  const estadoRota = useRotaAteCampus(view === 'lista' ? undefined : selecionado, campusReferencia, { atrasoMs: 400 });

  // Mantém o card do carrossel centralizado quando o pino é escolhido no mapa.
  useEffect(() => {
    if (view !== 'mapa' || !selectedId) return;
    const container = carrosselRef.current;
    const alvo = cardsRef.current[selectedId];
    if (!container || !alvo) return;
    const left = alvo.offsetLeft - (container.clientWidth - alvo.offsetWidth) / 2;
    container.scrollTo({ left, behavior: 'smooth' });
  }, [selectedId, view]);

  useEffect(() => () => window.clearTimeout(scrollTimer.current), []);

  const aoRolarCarrossel = () => {
    window.clearTimeout(scrollTimer.current);
    scrollTimer.current = window.setTimeout(() => {
      const container = carrosselRef.current;
      if (!container) return;
      const centro = container.scrollLeft + container.clientWidth / 2;
      let melhorId: string | undefined;
      let menorDistancia = Infinity;
      for (const { anuncio } of resultados) {
        const el = cardsRef.current[anuncio.id];
        if (!el) continue;
        const distancia = Math.abs(el.offsetLeft + el.offsetWidth / 2 - centro);
        if (distancia < menorDistancia) {
          menorDistancia = distancia;
          melhorId = anuncio.id;
        }
      }
      if (melhorId && melhorId !== selectedId) setSelectedId(melhorId);
    }, 140);
  };

  const toggleFav = async (anuncioId: string) => {
    const r = await acoes.alternarFavorito(user.id, anuncioId);
    if (r.ok) toast.success(r.data ? 'Salvo nos favoritos' : 'Removido dos favoritos');
  };

  const cardResultado = (anuncio: (typeof resultados)[number]) => (
    <AnuncioCard
      anuncio={anuncio.anuncio}
      capa={capaDoAnuncio(db, anuncio.anuncio.id)}
      to={linkAnuncio(anuncio.anuncio.id)}
      estimativa={anuncio.estimativa}
      avaliacao={anuncio.avaliacao}
      favorito={isFavorito(db, user.id, anuncio.anuncio.id)}
      onToggleFavorito={() => toggleFav(anuncio.anuncio.id)}
      totalFotos={fotosDoAnuncio(db, anuncio.anuncio.id).length}
      highlighted={selectedId === anuncio.anuncio.id}
      onMouseEnter={() => setSelectedId(anuncio.anuncio.id)}
    />
  );

  return (
    <>
      <PageHeader
        title="Encontre sua moradia"
        subtitle={
          <div className="mt-2 flex flex-col items-start gap-1.5 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
            <SeletorLocalidade
              cidade={filtros.cidade}
              estado={filtros.estado}
              onChange={({ cidade, estado }) => patchAplicado({ cidade, estado })}
            />
            <span className="hidden h-4 w-px bg-slate-200 sm:block" aria-hidden />
            <div className="flex min-w-0 max-w-full items-center gap-2">
              <span className="shrink-0 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                Perto de
              </span>
              <SeletorFaculdade
                instituicoes={db.instituicoes}
                instituicaoId={filtros.instituicao}
                label={campusReferenciaLabel || 'Escolher faculdade'}
                minhaInstituicaoId={minhaInstituicaoId}
                minhaLabel={campusLabel}
                onChange={escolherFaculdade}
              />
            </div>
          </div>
        }
        actions={
          <div className="hidden rounded-lg border border-slate-200 bg-white p-0.5 lg:flex">
            {(
              [
                ['lista', <LayoutList size={16} key="l" />, 'Lista'],
                ['ambos', <Columns2 size={16} key="a" />, 'Lista + mapa'],
                ['mapa', <MapIcon size={16} key="m" />, 'Mapa'],
              ] as const
            ).map(([v, icon, label]) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium',
                  view === v ? 'bg-brand-600 text-white' : 'text-slate-600 hover:bg-slate-100',
                  v === 'ambos' && 'hidden xl:inline-flex',
                  v === 'lista' && view === 'ambos' && 'max-xl:bg-brand-600 max-xl:text-white',
                )}
              >
                {icon} {label}
              </button>
            ))}
          </div>
        }
      />

      {/* Barra de filtros e ordenação */}
      <div className="sticky top-14 z-20 -mx-4 mb-4 border-b border-slate-200 bg-slate-50/95 px-4 py-2 backdrop-blur sm:-mx-6 sm:px-6 lg:static lg:z-auto lg:mx-0 lg:rounded-xl lg:border lg:bg-white lg:px-3 lg:py-2.5 lg:shadow-sm">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={abrirFiltros}
            className="relative shrink-0"
            icon={<SlidersHorizontal size={15} />}
          >
            Filtros
            {ativos > 0 && (
              <span className="ml-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-600 px-1 text-[11px] font-semibold text-white">
                {ativos}
              </span>
            )}
          </Button>
          <div className="relative min-w-0 flex-1 lg:max-w-xs">
            <ArrowUpDown size={13} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <select
              aria-label="Ordenar por"
              value={filtros.ordem}
              onChange={(e) => patchAplicado({ ordem: e.target.value as Ordem })}
              className="h-10 w-full appearance-none rounded-lg border border-slate-300 bg-white pl-8 pr-7 text-xs font-medium text-slate-700 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            >
              {ordens.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <ChevronDown size={13} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>
          <span className="shrink-0 text-xs font-medium text-slate-500">
            {resultados.length}
            <span className="hidden sm:inline"> imóveis</span>
          </span>
        </div>
        {chips.length > 0 && (
          <div className={cn('mt-2 lg:mt-2.5', view === 'mapa' && 'hidden lg:block')}>{chipsAtivos}</div>
        )}
      </div>

      {resultados.length === 0 ? (
        <EmptyState
          icon={<SearchX size={24} />}
          title="Nenhum imóvel encontrado"
          description="Tente ampliar a faixa de preço, a distância máxima ou remover algumas comodidades."
          action={<Button variant="outline" onClick={limparTudo}>Limpar filtros</Button>}
        />
      ) : (
        <div className={cn('grid grid-cols-1 gap-6', view === 'ambos' && 'xl:grid-cols-[1fr_minmax(380px,42%)]')}>
          {view !== 'mapa' && (
            <div
              className={cn(
                'grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4',
                view === 'lista' ? 'lg:grid-cols-3 xl:grid-cols-4' : 'xl:grid-cols-2',
                view === 'ambos' && 'lg:grid-cols-3 xl:grid-cols-2',
              )}
            >
              {resultados.map((resultado) => (
                <div key={resultado.anuncio.id} className="min-w-0">{cardResultado(resultado)}</div>
              ))}
            </div>
          )}
          {view !== 'lista' && (
            <div
              className={cn(
                'relative overflow-hidden rounded-xl border border-slate-200 shadow-sm',
                view === 'mapa'
                  ? 'h-[calc(100dvh-21rem)] min-h-[280px] sm:h-[calc(100dvh-17.5rem)] lg:h-[70vh]'
                  : 'hidden h-[calc(100vh-8rem)] xl:sticky xl:top-8 xl:block',
              )}
            >
              <AnunciosMap
                anuncios={resultados.map((r) => r.anuncio)}
                campus={campusReferencia}
                campusLabel={campusReferenciaLabel}
                selectedId={selectedId}
                onSelect={setSelectedId}
                linkTo={linkAnuncio}
                rota={estadoRota?.status === 'ok' ? estadoRota.rota.trajeto : undefined}
              />
              {selecionado && estadoRota && (
                <div className="absolute left-3 right-3 top-16 z-[1000] rounded-xl border border-slate-200 bg-white/95 px-3 py-2 shadow-lg backdrop-blur xl:left-14 xl:right-3 xl:top-3">
                  <p className="mb-1 truncate text-xs font-medium text-slate-700">{selecionado.titulo} → {campusReferenciaLabel}</p>
                  <RotaInfo estado={estadoRota} />
                </div>
              )}
              {view === 'mapa' && (
                <>
                  <button
                    onClick={() => setView('lista')}
                    className="absolute right-3 top-3 z-[1000] inline-flex h-10 items-center gap-1.5 rounded-full bg-white/95 px-3.5 text-xs font-semibold text-slate-700 shadow-lg backdrop-blur lg:hidden"
                  >
                    <LayoutList size={15} /> Ver lista
                  </button>
                  <div className="fixed inset-x-4 floating-above-nav z-[1000] xl:hidden">
                    <div
                      ref={carrosselRef}
                      onScroll={aoRolarCarrossel}
                      className="no-scrollbar flex snap-x snap-mandatory gap-2 overflow-x-auto px-3 pb-2 pt-4"
                    >
                      {resultados.map((resultado) => (
                        <div
                          key={resultado.anuncio.id}
                          ref={(el) => {
                            cardsRef.current[resultado.anuncio.id] = el;
                          }}
                          className="w-[82%] shrink-0 snap-center"
                        >
                          <AnuncioMiniCard
                            anuncio={resultado.anuncio}
                            capa={capaDoAnuncio(db, resultado.anuncio.id)}
                            to={linkAnuncio(resultado.anuncio.id)}
                            estimativa={resultado.estimativa}
                            avaliacao={resultado.avaliacao}
                            favorito={isFavorito(db, user.id, resultado.anuncio.id)}
                            onToggleFavorito={() => toggleFav(resultado.anuncio.id)}
                            highlighted={selectedId === resultado.anuncio.id}
                            onSelect={() => setSelectedId(resultado.anuncio.id)}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* Alterna entre lista e mapa no mobile */}
      {view !== 'mapa' && (
        <button
          onClick={() => setView('mapa')}
          className="floating-above-nav fixed right-4 z-30 inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:bg-slate-800 lg:hidden"
        >
          <MapIcon size={18} /> Mapa
        </button>
      )}

      <FiltrosSheet
        open={showFilters}
        onClose={() => setShowFilters(false)}
        valores={rascunho}
        onChange={patchRascunho}
        comodidades={db.comodidades}
        bairros={bairros}
        instituicoes={db.instituicoes}
        instituicaoPadrao={minhaInstituicaoId}
        total={totalRascunho}
        onLimpar={limparRascunho}
        onAplicar={aplicarFiltros}
      />
    </>
  );
}
