import { useState, type ReactNode } from 'react';
import { Check, MapPin } from 'lucide-react';
import { CurrencyInput, SelectInput, Toggle } from '@/shared/components/form';
import { Button, Sheet } from '@/shared/components/ui';
import type { Comodidade, InstituicaoEnsino, TipoImovel } from '@/shared/types/domain';
import { cn, numberToCurrencyMask, parseCurrency, tipoImovelLabel } from '@/shared/utils';
import { faixasPreco, type FiltrosBusca } from '../filtros';
import { ordenarInstituicoes } from '../instituicoesOrdenadas';

interface FiltrosFormProps {
  valores: FiltrosBusca;
  onChange: (patch: Partial<FiltrosBusca>) => void;
  comodidades: Comodidade[];
  bairros: string[];
  instituicoes: InstituicaoEnsino[];
  /** Instituição do aluno, fixada no topo da lista (padrão da busca). */
  instituicaoPadrao?: string;
}

function Secao({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <section className="space-y-2.5">
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</h3>
        {hint && <p className="mt-0.5 text-xs text-slate-400">{hint}</p>}
      </div>
      {children}
    </section>
  );
}

function Chip({ active, onClick, children }: { active?: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-sm font-medium transition',
        active
          ? 'border-brand-600 bg-brand-50 text-brand-700'
          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-800',
      )}
    >
      {active && <Check size={13} />}
      {children}
    </button>
  );
}

/** Campos de filtro compartilhados entre o painel desktop e o bottom sheet mobile. */
export function FiltrosForm({ valores, onChange, comodidades, bairros, instituicoes, instituicaoPadrao }: FiltrosFormProps) {
  const min = parseCurrency(valores.precoMin);
  const max = parseCurrency(valores.precoMax);
  const [todasComodidades, setTodasComodidades] = useState(false);

  const selecionarFaixa = (faixaMin: number, faixaMax: number) => {
    const ativa = (faixaMin ? min === faixaMin : !min) && (faixaMax ? max === faixaMax : !max);
    onChange({
      precoMin: !ativa && faixaMin ? numberToCurrencyMask(faixaMin) : '',
      precoMax: !ativa && faixaMax ? numberToCurrencyMask(faixaMax) : '',
    });
  };

  const alternarComodidade = (id: string) =>
    onChange({
      comodidades: valores.comodidades.includes(id)
        ? valores.comodidades.filter((c) => c !== id)
        : [...valores.comodidades, id],
    });

  const comodidadesVisiveis = todasComodidades ? comodidades : comodidades.slice(0, 12);
  const instituicoesOrdenadas = ordenarInstituicoes(instituicoes, instituicaoPadrao);

  const mudarInstituicao = (instituicao: string) => {
    if (!instituicao) {
      onChange({ instituicao: '', distanciaMax: '' });
      return;
    }
    onChange({ instituicao, distanciaMax: valores.distanciaMax || '2' });
  };

  return (
    <div className="space-y-6">
      <Secao title="Localização">
        <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm">
          <MapPin size={15} className="shrink-0 text-brand-600" />
          <span className="font-medium text-slate-700">
            {valores.cidade} – {valores.estado}
          </span>
          <span className="ml-auto text-xs text-slate-400">em breve outras cidades</span>
        </div>
      </Secao>

      <Secao
        title="Faculdade"
        hint={`${instituicoes.length} IES com sede administrativa em Juiz de Fora (Censo da Educação Superior 2024 – INEP). As distâncias passam a ser calculadas até a sede escolhida.`}
      >
        <SelectInput
          label=""
          aria-label="Faculdade"
          value={valores.instituicao}
          onChange={mudarInstituicao}
          placeholder="Minha faculdade (padrão)"
          options={instituicoesOrdenadas.map((i) => ({ value: i.id, label: `${i.sigla} – ${i.nome}` }))}
        />
        {valores.instituicao && (
          <div className="space-y-2 pt-1">
            <p className="text-xs font-medium text-slate-600">Raio de busca a partir da sede</p>
            <div className="flex flex-wrap gap-2">
              {['0.5', '1', '2', '3', '5'].map((km) => (
                <Chip
                  key={km}
                  active={valores.distanciaMax === km}
                  onClick={() => onChange({ distanciaMax: valores.distanciaMax === km ? '' : km })}
                >
                  Até {km.replace('.', ',')} km
                </Chip>
              ))}
              <Chip active={!valores.distanciaMax} onClick={() => onChange({ distanciaMax: '' })}>
                Qualquer
              </Chip>
            </div>
          </div>
        )}
      </Secao>

      <Secao title="Faixa de preço">
        <div className="grid grid-cols-2 gap-3">
          <CurrencyInput label="Mínimo" value={valores.precoMin} onChange={(v) => onChange({ precoMin: v })} />
          <CurrencyInput label="Máximo" value={valores.precoMax} onChange={(v) => onChange({ precoMax: v })} />
        </div>
        <div className="flex flex-wrap gap-2">
          {faixasPreco.map((faixa) => (
            <Chip
              key={faixa.value}
              active={(faixa.min ? min === faixa.min : !min) && (faixa.max ? max === faixa.max : !max)}
              onClick={() => selecionarFaixa(faixa.min, faixa.max)}
            >
              {faixa.label}
            </Chip>
          ))}
        </div>
      </Secao>

      <Secao title="Tipo de imóvel">
        <div className="flex flex-wrap gap-2">
          {(Object.entries(tipoImovelLabel) as Array<[TipoImovel, string]>).map(([value, label]) => (
            <Chip
              key={value}
              active={valores.tipo === value}
              onClick={() => onChange({ tipo: valores.tipo === value ? '' : value })}
            >
              {label}
            </Chip>
          ))}
        </div>
      </Secao>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Secao title="Quartos (mínimo)">
          <div className="flex flex-wrap gap-2">
            {['1', '2', '3'].map((n) => (
              <Chip
                key={n}
                active={valores.quartosMin === n}
                onClick={() => onChange({ quartosMin: valores.quartosMin === n ? '' : n })}
              >
                {n}+ quarto{n === '1' ? '' : 's'}
              </Chip>
            ))}
          </div>
        </Secao>

        <Secao title="Avaliação mínima">
          <div className="flex flex-wrap gap-2">
            {['4', '4.5'].map((n) => (
              <Chip
                key={n}
                active={valores.avaliacaoMin === n}
                onClick={() => onChange({ avaliacaoMin: valores.avaliacaoMin === n ? '' : n })}
              >
                {n.replace('.', ',')}+ estrelas
              </Chip>
            ))}
          </div>
        </Secao>
      </div>

      <Secao title="Bairro">
        <SelectInput
          label=""
          aria-label="Bairro"
          value={valores.bairro}
          onChange={(v) => onChange({ bairro: v })}
          placeholder="Todos os bairros"
          options={bairros.map((b) => ({ value: b, label: b }))}
        />
      </Secao>

      {!valores.instituicao && (
        <Secao title="Distância até o campus">
          <div className="flex flex-wrap gap-2">
            {['0.5', '1', '2', '3', '5'].map((km) => (
              <Chip
                key={km}
                active={valores.distanciaMax === km}
                onClick={() => onChange({ distanciaMax: valores.distanciaMax === km ? '' : km })}
              >
                Até {km.replace('.', ',')} km
              </Chip>
            ))}
          </div>
        </Secao>
      )}

      <Secao title="Comodidades" hint="O imóvel precisa ter todas as opções selecionadas.">
        <div className="flex flex-wrap gap-2">
          {comodidadesVisiveis.map((c) => (
            <Chip key={c.id} active={valores.comodidades.includes(c.id)} onClick={() => alternarComodidade(c.id)}>
              {c.nome}
            </Chip>
          ))}
        </div>
        {comodidades.length > 12 && (
          <Button variant="ghost" size="sm" onClick={() => setTodasComodidades((v) => !v)}>
            {todasComodidades ? 'Mostrar menos' : `Ver todas (${comodidades.length})`}
          </Button>
        )}
      </Secao>

      <Secao title="Preferências">
        <div className="flex flex-col gap-3">
          <Toggle label="Mobiliado" checked={valores.mobiliado} onChange={(v) => onChange({ mobiliado: v })} />
          <Toggle label="Disponível já" checked={valores.imediato} onChange={(v) => onChange({ imediato: v })} />
        </div>
      </Secao>
    </div>
  );
}

interface FiltrosSheetProps extends FiltrosFormProps {
  open: boolean;
  onClose: () => void;
  total: number;
  onLimpar: () => void;
  onAplicar: () => void;
}

export function FiltrosSheet({ open, onClose, total, onLimpar, onAplicar, ...form }: FiltrosSheetProps) {
  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Filtros"
      description="Refine sua busca e veja o resultado atualizado"
      footer={
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={onLimpar}>
            Limpar
          </Button>
          <Button fullWidth onClick={onAplicar}>
            Ver {total} {total === 1 ? 'imóvel' : 'imóveis'}
          </Button>
        </div>
      }
    >
      <FiltrosForm {...form} />
    </Sheet>
  );
}
