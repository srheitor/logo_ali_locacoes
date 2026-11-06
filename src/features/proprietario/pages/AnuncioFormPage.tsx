import { useState, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ImagePlus, Plus, X } from 'lucide-react';
import { useData } from '@/app/providers/DataProvider';
import { useCurrentUser } from '@/features/auth/AuthProvider';
import { LocationPicker } from '@/features/anuncios/components/LocationPicker';
import { fotoMock } from '@/mocks/helpers';
import { salvarAnuncio } from '@/services/actions';
import { fotosDoAnuncio, getAnuncio, regrasDoAnuncio } from '@/services/queries';
import {
  CepInput,
  CurrencyInput,
  FormField,
  PhotoUploader,
  SelectInput,
  TextAreaInput,
  TextInput,
  Toggle,
} from '@/shared/components/form';
import type { Endereco } from '@/shared/services/viacep';
import { useToast } from '@/shared/components/feedback/Toast';
import { Button, Card, CardBody, CardHeader, PageHeader } from '@/shared/components/ui';
import { useForm } from '@/shared/hooks/useForm';
import type { TipoImovel } from '@/shared/types/domain';
import { cepValidator, cn, numberToCurrencyMask, parseCurrency, required, tipoImovelLabel } from '@/shared/utils';

const CENTRO_JF = { lat: -21.7642, lng: -43.3496 };

/** "Rua Halfeld, 1020" -> { logradouro: "Rua Halfeld", numero: "1020" } */
function separarEndereco(endereco = '') {
  const i = endereco.lastIndexOf(',');
  return i < 0 ? { logradouro: endereco, numero: '' } : { logradouro: endereco.slice(0, i).trim(), numero: endereco.slice(i + 1).trim() };
}

/** RF03 — cadastro/edição de anúncio pelo proprietário. */
export function AnuncioFormPage() {
  const { id } = useParams();
  const { db, run } = useData();
  const user = useCurrentUser();
  const toast = useToast();
  const navigate = useNavigate();
  const existente = id ? getAnuncio(db, id) : undefined;
  const enderecoExistente = separarEndereco(existente?.endereco);

  const form = useForm(
    {
      titulo: existente?.titulo ?? '',
      descricao: existente?.descricao ?? '',
      valor: existente ? numberToCurrencyMask(existente.valor_aluguel) : '',
      tipo: existente?.tipo_imovel ?? '',
      quartos: String(existente?.quantidade_quartos ?? 1),
      cep: existente?.cep ?? '',
      logradouro: enderecoExistente.logradouro,
      numero: enderecoExistente.numero,
      bairro: existente?.bairro ?? '',
      cidade: existente?.cidade ?? '',
      uf: existente?.uf ?? '',
    },
    {
      titulo: [required()],
      descricao: [required()],
      valor: [required(), (v) => (parseCurrency(v) > 0 ? undefined : 'O valor deve ser maior que zero')],
      tipo: [required('Selecione o tipo')],
      quartos: [required(), (v) => (Number(v) >= 0 ? undefined : 'Não pode ser negativo')],
      cep: [required(), cepValidator],
      logradouro: [required()],
      numero: [required('Informe o número (ou s/n)')],
      bairro: [required()],
      cidade: [required()],
      uf: [required()],
    },
  );

  const [mobiliado, setMobiliado] = useState(existente?.mobiliado ?? false);
  const [imediato, setImediato] = useState(existente?.disponibilidade_imediata ?? true);
  const [coords, setCoords] = useState({ lat: existente?.latitude ?? CENTRO_JF.lat, lng: existente?.longitude ?? CENTRO_JF.lng });
  const [fotos, setFotos] = useState<string[]>(existente ? fotosDoAnuncio(db, existente.id).map((f) => f.url) : []);
  const [comodidades, setComodidades] = useState<string[]>(
    existente ? db.anuncioComodidades.filter((ac) => ac.anuncio_id === existente.id).map((ac) => ac.comodidade_id) : [],
  );
  const [regras, setRegras] = useState<string[]>(existente ? regrasDoAnuncio(db, existente.id).map((r) => r.descricao) : []);
  const [novaRegra, setNovaRegra] = useState('');
  const [fotosError, setFotosError] = useState<string>();

  if (id && (!existente || existente.proprietario_id !== user.id)) {
    return <p className="text-slate-500">Anúncio não encontrado.</p>;
  }

  /** Preenchimento automático pelo ViaCEP. CEPs gerais de cidade não trazem rua/bairro: o usuário completa. */
  const onAddressFound = (e: Endereco) => {
    form.setField('logradouro', e.logradouro);
    form.setField('bairro', e.bairro);
    form.setField('cidade', e.cidade);
    form.setField('uf', e.uf);
    document.getElementById(e.logradouro ? 'anuncio-numero' : 'anuncio-logradouro')?.focus();
  };

  const addRegra = () => {
    if (!novaRegra.trim()) return;
    setRegras((r) => [...r, novaRegra.trim()]);
    setNovaRegra('');
  };

  const usarFotosExemplo = () => {
    const seed = Math.floor(Math.random() * 1000);
    setFotos((f) => [...f, ...(['bedroom', 'livingroom', 'kitchen'] as const).map((c) => fotoMock(c, seed))]);
    setFotosError(undefined);
  };

  const salvar = (e: FormEvent) => {
    e.preventDefault();
    const valid = form.validateAll();
    if (fotos.length < 3) setFotosError('Envie no mínimo 3 fotos (RN06).');
    if (!valid || fotos.length < 3) return toast.error('Verifique os campos destacados.');

    const v = form.values;
    const r = run((d) =>
      salvarAnuncio(
        d,
        user.id,
        {
          titulo: v.titulo,
          descricao: v.descricao,
          valor_aluguel: parseCurrency(v.valor),
          tipo_imovel: v.tipo as TipoImovel,
          quantidade_quartos: Number(v.quartos),
          mobiliado,
          disponibilidade_imediata: imediato,
          cep: v.cep,
          endereco: `${v.logradouro.trim()}, ${v.numero.trim()}`,
          bairro: v.bairro,
          cidade: v.cidade,
          uf: v.uf.toUpperCase(),
          latitude: coords.lat,
          longitude: coords.lng,
          fotos,
          comodidades,
          regras,
        },
        existente?.id,
      ),
    );
    if (!r.ok) return toast.error(r.error);
    toast.success(existente ? 'Anúncio atualizado!' : 'Anúncio enviado para moderação!');
    navigate('/proprietario/anuncios');
  };

  return (
    <>
      <button onClick={() => navigate(-1)} className="mb-4 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800">
        <ArrowLeft size={16} /> Voltar
      </button>
      <PageHeader
        title={existente ? 'Editar anúncio' : 'Novo anúncio'}
        subtitle={existente ? existente.titulo : 'Novos anúncios passam pela moderação antes de aparecer na busca.'}
      />

      <form onSubmit={salvar} className="space-y-6" noValidate>
        <Card>
          <CardHeader title="Informações do imóvel" />
          <CardBody className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <TextInput label="Título do anúncio" required className="sm:col-span-2 lg:col-span-4" placeholder="Ex.: Kitnet mobiliada perto da UFJF" {...form.field('titulo')} />
            <SelectInput
              label="Tipo de imóvel"
              required
              placeholder="Selecione..."
              options={Object.entries(tipoImovelLabel).map(([value, label]) => ({ value, label }))}
              {...form.field('tipo')}
            />
            <CurrencyInput label="Valor do aluguel (mensal)" required {...form.field('valor')} />
            <TextInput label="Quantidade de quartos" type="number" min={0} required inputMode="numeric" {...form.field('quartos')} />
            <div className="flex flex-col justify-end gap-3 pb-1">
              <Toggle label="Mobiliado" checked={mobiliado} onChange={setMobiliado} />
              <Toggle label="Disponível imediatamente" checked={imediato} onChange={setImediato} />
            </div>
            <TextAreaInput label="Descrição" required rows={4} className="sm:col-span-2 lg:col-span-4" placeholder="Descreva o imóvel, a vizinhança, o transporte..." {...form.field('descricao')} />
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Endereço e localização" subtitle="Digite o CEP para preencher o endereço e clique no mapa para posicionar o imóvel." />
          <CardBody className="grid gap-4 lg:grid-cols-2">
            <div className="grid content-start gap-4 sm:grid-cols-2">
              <CepInput required onAddressFound={onAddressFound} className="sm:col-span-2" {...form.field('cep')} />
              <TextInput id="anuncio-logradouro" label="Rua / avenida" required className="sm:col-span-2" {...form.field('logradouro')} />
              <TextInput id="anuncio-numero" label="Número" required placeholder="Ex.: 120 ou s/n" {...form.field('numero')} />
              <TextInput label="Bairro" required {...form.field('bairro')} />
              <TextInput label="Cidade" required {...form.field('cidade')} />
              <TextInput label="UF" required maxLength={2} {...form.field('uf')} />
              <p className="text-xs text-slate-500 sm:col-span-2">
                Coordenadas: {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
              </p>
            </div>
            <LocationPicker latitude={coords.lat} longitude={coords.lng} onChange={(lat, lng) => setCoords({ lat, lng })} />
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title="Fotos"
            action={<Button size="sm" variant="ghost" icon={<ImagePlus size={14} />} onClick={usarFotosExemplo}>Usar fotos de exemplo</Button>}
          />
          <CardBody>
            <PhotoUploader label="" photos={fotos} onChange={(f) => { setFotos(f); setFotosError(undefined); }} error={fotosError} />
          </CardBody>
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader title="Comodidades" />
            <CardBody className="flex flex-wrap gap-2">
              {db.comodidades.map((c) => {
                const ativo = comodidades.includes(c.id);
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setComodidades((list) => (ativo ? list.filter((x) => x !== c.id) : [...list, c.id]))}
                    className={cn('rounded-full border px-3 py-1.5 text-sm transition', ativo ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-slate-300 text-slate-600 hover:border-slate-400')}
                  >
                    {c.nome}
                  </button>
                );
              })}
            </CardBody>
          </Card>
          <Card>
            <CardHeader title="Regras da casa" />
            <CardBody className="space-y-3">
              <FormField>
                <div className="flex gap-2">
                  <input
                    value={novaRegra}
                    onChange={(e) => setNovaRegra(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addRegra())}
                    placeholder="Ex.: Silêncio após as 22h"
                    className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                  />
                  <Button variant="secondary" icon={<Plus size={16} />} onClick={addRegra}>Adicionar</Button>
                </div>
              </FormField>
              <ul className="space-y-1.5">
                {regras.map((r, i) => (
                  <li key={`${r}-${i}`} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700">
                    {r}
                    <button type="button" onClick={() => setRegras((list) => list.filter((_, j) => j !== i))} className="text-slate-400 hover:text-red-600" aria-label="Remover regra">
                      <X size={16} />
                    </button>
                  </li>
                ))}
              </ul>
            </CardBody>
          </Card>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => navigate(-1)}>Cancelar</Button>
          <Button type="submit" size="lg">{existente ? 'Salvar alterações' : 'Publicar anúncio'}</Button>
        </div>
      </form>
    </>
  );
}
