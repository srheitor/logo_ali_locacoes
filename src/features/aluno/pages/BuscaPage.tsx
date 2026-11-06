import { useMemo, useState } from 'react';
import { LayoutList, Map as MapIcon, Columns2, SearchX, SlidersHorizontal, GraduationCap } from 'lucide-react';
import { useData } from '@/app/providers/DataProvider';
import { AnuncioCard } from '@/features/anuncios/components/AnuncioCard';
import { AnunciosMap } from '@/features/anuncios/components/AnunciosMap';
import { alternarFavorito } from '@/services/actions';
import { anunciosPublicos, capaDoAnuncio, deslocamentoAteCampus, isFavorito, mediaAvaliacoes } from '@/services/queries';
import { CurrencyInput, SelectInput, Toggle } from '@/shared/components/form';
import { useToast } from '@/shared/components/feedback/Toast';
import { Button, Card, EmptyState, PageHeader } from '@/shared/components/ui';
import type { TipoImovel } from '@/shared/types/domain';
import { cn, parseCurrency, tipoImovelLabel } from '@/shared/utils';
import { useEstudanteAtual } from '../useEstudanteAtual';

type View = 'lista' | 'mapa' | 'ambos';
type Ordem = 'distancia' | 'preco' | 'avaliacao';

const filtrosIniciais = {
  precoMin: '',
  precoMax: '',
  tipo: '' as TipoImovel | '',
  distanciaMax: '',
  mobiliado: false,
  imediato: false,
  ordem: 'distancia' as Ordem,
};

/** RF05 + RF06 — busca com filtros, em lista e no mapa. */
export function BuscaPage() {
  const { db, run } = useData();
  const toast = useToast();
  const { user, estudante, campus, campusLabel } = useEstudanteAtual();
  const [filtros, setFiltros] = useState(filtrosIniciais);
  const [view, setView] = useState<View>('ambos');
  const [selectedId, setSelectedId] = useState<string>();
  const [showFilters, setShowFilters] = useState(false);

  const set = <K extends keyof typeof filtros>(key: K, value: (typeof filtros)[K]) => setFiltros((f) => ({ ...f, [key]: value }));

  const resultados = useMemo(() => {
    const min = parseCurrency(filtros.precoMin);
    const max = parseCurrency(filtros.precoMax);
    const distMax = Number(filtros.distanciaMax) || Infinity;

    return anunciosPublicos(db)
      .map((a) => ({
        anuncio: a,
        estimativa: deslocamentoAteCampus(db, a, estudante?.campus_id),
        avaliacao: mediaAvaliacoes(db, a.id),
      }))
      .filter(({ anuncio: a, estimativa }) => {
        if (min && a.valor_aluguel < min) return false;
        if (max && a.valor_aluguel > max) return false;
        if (filtros.tipo && a.tipo_imovel !== filtros.tipo) return false;
        if (filtros.mobiliado && !a.mobiliado) return false;
        if (filtros.imediato && !a.disponibilidade_imediata) return false;
        if (estimativa && estimativa.distanciaKm > distMax) return false;
        return true;
      })
      .sort((x, y) => {
        if (filtros.ordem === 'preco') return x.anuncio.valor_aluguel - y.anuncio.valor_aluguel;
        if (filtros.ordem === 'avaliacao') return y.avaliacao.media - x.avaliacao.media;
        return (x.estimativa?.distanciaKm ?? 0) - (y.estimativa?.distanciaKm ?? 0);
      });
  }, [db, filtros, estudante?.campus_id]);

  const toggleFav = (anuncioId: string) => {
    const r = run((d) => alternarFavorito(d, user.id, anuncioId));
    if (r.ok) toast.success(r.data ? 'Salvo nos favoritos' : 'Removido dos favoritos');
  };

  const filtrosAtivos =
    !!filtros.precoMin || !!filtros.precoMax || !!filtros.tipo || !!filtros.distanciaMax || filtros.mobiliado || filtros.imediato;

  return (
    <>
      <PageHeader
        title="Encontre sua moradia"
        subtitle={
          campus && (
            <span className="inline-flex items-center gap-1.5">
              <GraduationCap size={16} className="text-brand-600" /> Distâncias calculadas até <strong className="font-medium text-slate-700">{campusLabel}</strong>
            </span>
          )
        }
        actions={
          <div className="flex rounded-lg border border-slate-200 bg-white p-0.5">
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
                className={cn('inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium', view === v ? 'bg-brand-600 text-white' : 'text-slate-600 hover:bg-slate-100', v === 'ambos' && 'hidden xl:inline-flex', v === 'lista' && view === 'ambos' && 'max-xl:bg-brand-600 max-xl:text-white')}
              >
                {icon} <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>
        }
      />

      {/* Filtros (RF05) */}
      <Card className="mb-6 p-4">
        <div className="flex items-center justify-between lg:hidden">
          <button onClick={() => setShowFilters((s) => !s)} className="inline-flex items-center gap-2 text-sm font-medium text-slate-700">
            <SlidersHorizontal size={16} /> Filtros {filtrosAtivos && <span className="h-2 w-2 rounded-full bg-accent-500" />}
          </button>
          <span className="text-sm text-slate-500">{resultados.length} imóveis</span>
        </div>
        <div className={cn('grid gap-4 sm:grid-cols-2 lg:grid-cols-6 lg:items-end', showFilters ? 'mt-4' : 'hidden lg:grid')}>
          <CurrencyInput label="Preço mínimo" value={filtros.precoMin} onChange={(v) => set('precoMin', v)} />
          <CurrencyInput label="Preço máximo" value={filtros.precoMax} onChange={(v) => set('precoMax', v)} />
          <SelectInput
            label="Tipo de imóvel"
            value={filtros.tipo}
            onChange={(v) => set('tipo', v as TipoImovel | '')}
            placeholder="Todos"
            options={Object.entries(tipoImovelLabel).map(([value, label]) => ({ value, label }))}
          />
          <SelectInput
            label="Distância máxima"
            value={filtros.distanciaMax}
            onChange={(v) => set('distanciaMax', v)}
            placeholder="Qualquer"
            options={['0.5', '1', '2', '3', '5'].map((km) => ({ value: km, label: `Até ${km.replace('.', ',')} km` }))}
          />
          <SelectInput
            label="Ordenar por"
            value={filtros.ordem}
            onChange={(v) => set('ordem', v as Ordem)}
            options={[
              { value: 'distancia', label: 'Mais perto do campus' },
              { value: 'preco', label: 'Menor preço' },
              { value: 'avaliacao', label: 'Melhor avaliação' },
            ]}
          />
          <div className="flex flex-col gap-2.5 pb-1">
            <Toggle label="Mobiliado" checked={filtros.mobiliado} onChange={(v) => set('mobiliado', v)} />
            <Toggle label="Disponível já" checked={filtros.imediato} onChange={(v) => set('imediato', v)} />
          </div>
        </div>
        {filtrosAtivos && (
          <div className={cn('mt-3 items-center justify-between border-t border-slate-100 pt-3', showFilters ? 'flex' : 'hidden lg:flex')}>
            <span className="text-sm text-slate-500">{resultados.length} imóveis encontrados</span>
            <Button variant="ghost" size="sm" onClick={() => setFiltros(filtrosIniciais)}>Limpar filtros</Button>
          </div>
        )}
      </Card>

      {resultados.length === 0 ? (
        <EmptyState icon={<SearchX size={24} />} title="Nenhum imóvel encontrado" description="Tente ampliar a faixa de preço ou a distância máxima." action={<Button variant="outline" onClick={() => setFiltros(filtrosIniciais)}>Limpar filtros</Button>} />
      ) : (
        <div className={cn('grid gap-6', view === 'ambos' && 'xl:grid-cols-[1fr_minmax(380px,42%)]')}>
          {view !== 'mapa' && (
            <div className={cn('grid gap-4 sm:grid-cols-2', view === 'lista' ? 'lg:grid-cols-3 xl:grid-cols-4' : 'xl:grid-cols-2', view === 'ambos' && 'lg:grid-cols-3 xl:grid-cols-2')}>
              {resultados.map(({ anuncio, estimativa, avaliacao }) => (
                <AnuncioCard
                  key={anuncio.id}
                  anuncio={anuncio}
                  capa={capaDoAnuncio(db, anuncio.id)}
                  to={`/aluno/anuncios/${anuncio.id}`}
                  estimativa={estimativa}
                  avaliacao={avaliacao}
                  favorito={isFavorito(db, user.id, anuncio.id)}
                  onToggleFavorito={() => toggleFav(anuncio.id)}
                  highlighted={selectedId === anuncio.id}
                  onMouseEnter={() => setSelectedId(anuncio.id)}
                />
              ))}
            </div>
          )}
          {view !== 'lista' && (
            <div className={cn('overflow-hidden rounded-xl border border-slate-200 shadow-sm', view === 'mapa' ? 'h-[70vh]' : 'hidden h-[calc(100vh-8rem)] xl:sticky xl:top-8 xl:block')}>
              <AnunciosMap
                anuncios={resultados.map((r) => r.anuncio)}
                campus={campus}
                campusLabel={campusLabel}
                selectedId={selectedId}
                onSelect={setSelectedId}
                linkTo={(id) => `/aluno/anuncios/${id}`}
              />
            </div>
          )}
        </div>
      )}
    </>
  );
}
