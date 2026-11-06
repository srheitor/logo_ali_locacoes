import { useEffect, useRef, useState } from 'react';
import { buscarEnderecoPorCep, CepError, type Endereco } from '@/shared/services/viacep';
import { onlyDigits } from '@/shared/utils/masks';

export type CepLookupStatus = 'idle' | 'loading' | 'success' | 'error';

interface Options {
  /** Chamado uma vez para cada CEP encontrado. */
  onFound?: (endereco: Endereco) => void;
  /** Desliga a busca (ex.: campo desabilitado). */
  enabled?: boolean;
}

/**
 * Consulta o ViaCEP automaticamente quando o valor atinge 8 dígitos.
 * Cancela a requisição anterior se o usuário continuar digitando.
 */
export function useCepLookup(cep: string, { onFound, enabled = true }: Options = {}) {
  const [status, setStatus] = useState<CepLookupStatus>('idle');
  const [endereco, setEndereco] = useState<Endereco>();
  const [error, setError] = useState<string>();
  const onFoundRef = useRef(onFound);
  onFoundRef.current = onFound;
  const digits = onlyDigits(cep);
  // Um CEP já preenchido ao montar (ex.: edição) só exibe o resultado, sem sobrescrever o formulário.
  const lastFound = useRef<string | undefined>(digits.length === 8 ? digits : undefined);

  useEffect(() => {
    if (!enabled || digits.length !== 8) {
      setStatus('idle');
      setError(undefined);
      return;
    }
    const controller = new AbortController();
    setStatus('loading');
    setError(undefined);

    buscarEnderecoPorCep(digits, controller.signal)
      .then((result) => {
        setEndereco(result);
        setStatus('success');
        // Evita sobrescrever o formulário de novo ao re-renderizar com o mesmo CEP.
        if (lastFound.current !== digits) {
          lastFound.current = digits;
          onFoundRef.current?.(result);
        }
      })
      .catch((e) => {
        if (controller.signal.aborted) return;
        setEndereco(undefined);
        setStatus('error');
        setError(e instanceof CepError ? e.message : 'Erro ao consultar o CEP');
      });

    return () => controller.abort();
  }, [digits, enabled]);

  return { status, endereco, error, loading: status === 'loading' };
}
