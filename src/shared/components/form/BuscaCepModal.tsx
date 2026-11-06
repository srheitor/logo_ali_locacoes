import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Loader2, MapPin, Search } from 'lucide-react';
import { buscarCepsPorEndereco, CepError, UFS, validarBuscaPorEndereco, type Endereco } from '@/shared/services/viacep';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { SelectInput } from './SelectInput';
import { TextInput } from './TextInput';

interface BuscaCepModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (endereco: Endereco) => void;
  /** Valores iniciais (ex.: cidade padrão da plataforma). */
  defaultUf?: string;
  defaultCidade?: string;
}

/** "Não sei meu CEP": busca CEPs pelo endereço usando o ViaCEP. */
export function BuscaCepModal({ open, onClose, onSelect, defaultUf = 'MG', defaultCidade = 'Juiz de Fora' }: BuscaCepModalProps) {
  const [uf, setUf] = useState(defaultUf);
  const [cidade, setCidade] = useState(defaultCidade);
  const [logradouro, setLogradouro] = useState('');
  const [resultados, setResultados] = useState<Endereco[]>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();
  const controllerRef = useRef<AbortController>();

  useEffect(() => {
    if (!open) return;
    setLogradouro('');
    setResultados(undefined);
    setError(undefined);
    return () => controllerRef.current?.abort();
  }, [open]);

  const buscar = async (e: FormEvent) => {
    e.preventDefault();
    // O modal é um portal: sem isto o submit "sobe" pela árvore React e envia o formulário que contém o CepInput.
    e.stopPropagation();
    const invalido = validarBuscaPorEndereco({ uf, cidade, logradouro });
    if (invalido) return setError(invalido);

    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    setLoading(true);
    setError(undefined);
    try {
      setResultados(await buscarCepsPorEndereco({ uf, cidade, logradouro }, controller.signal));
    } catch (err) {
      if (!controller.signal.aborted) setError(err instanceof CepError ? err.message : 'Erro ao buscar');
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Buscar CEP pelo endereço" size="lg">
      <form onSubmit={buscar} className="grid gap-3 sm:grid-cols-[100px_1fr_1.4fr_auto] sm:items-end">
        <SelectInput label="UF" value={uf} onChange={setUf} options={UFS.map((u) => ({ value: u, label: u }))} />
        <TextInput label="Cidade" value={cidade} onChange={setCidade} />
        <TextInput label="Rua / avenida" value={logradouro} onChange={setLogradouro} placeholder="Ex.: Halfeld" autoFocus />
        <Button type="submit" loading={loading} icon={<Search size={16} />}>Buscar</Button>
      </form>
      {error && <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      {resultados && (
        <div className="mt-4">
          <p className="mb-2 text-xs text-slate-500">
            {resultados.length === 0
              ? 'Nenhum CEP encontrado. Confira a grafia ou tente só parte do nome da rua.'
              : `${resultados.length} resultado(s)${resultados.length === 50 ? ' — refine a busca para ver mais' : ''}. Clique para usar:`}
          </p>
          <ul className="max-h-80 divide-y divide-slate-100 overflow-y-auto rounded-lg border border-slate-200">
            {resultados.map((r) => (
              <li key={`${r.cep}-${r.complemento}`}>
                <button
                  type="button"
                  onClick={() => onSelect(r)}
                  className="flex w-full items-start gap-3 px-3 py-2.5 text-left text-sm hover:bg-brand-50"
                >
                  <MapPin size={16} className="mt-0.5 shrink-0 text-brand-600" />
                  <span className="min-w-0 flex-1">
                    <span className="block font-medium text-slate-800">
                      {r.logradouro}
                      {r.complemento && <span className="font-normal text-slate-500"> · {r.complemento}</span>}
                    </span>
                    <span className="block text-xs text-slate-500">{r.bairro} – {r.cidade}/{r.uf}</span>
                  </span>
                  <span className="shrink-0 font-mono text-sm font-semibold text-slate-700">{r.cep}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
      {loading && !resultados && (
        <p className="mt-4 flex items-center gap-2 text-sm text-slate-500"><Loader2 size={16} className="animate-spin" /> Consultando ViaCEP...</p>
      )}
    </Modal>
  );
}
