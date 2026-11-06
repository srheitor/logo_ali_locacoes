import { useState } from 'react';
import { CheckCircle2, Loader2, MapPin } from 'lucide-react';
import { useCepLookup } from '@/shared/hooks/useCepLookup';
import type { Endereco } from '@/shared/services/viacep';
import { maskCep } from '@/shared/utils';
import { BuscaCepModal } from './BuscaCepModal';
import { MaskedInput, type SpecializedInputProps } from './MaskedInput';

/** Mantido por compatibilidade: é o mesmo tipo `Endereco` do serviço ViaCEP. */
export type EnderecoViaCep = Endereco;

interface CepInputProps extends SpecializedInputProps {
  /** Chamado quando o CEP é encontrado no ViaCEP (digitado ou escolhido em "Não sei meu CEP"). */
  onAddressFound?: (endereco: Endereco) => void;
  /** Exibe o link "Não sei meu CEP" (busca pelo endereço). Padrão: ativo quando há `onAddressFound`. */
  allowAddressSearch?: boolean;
}

/**
 * CEP com máscara 00000-000 integrado ao ViaCEP:
 * - ao completar 8 dígitos, busca o endereço e chama `onAddressFound`;
 * - mostra o resultado (rua, bairro, cidade/UF) ou o erro (inválido, não encontrado, API fora do ar);
 * - opcionalmente permite descobrir o CEP a partir do endereço.
 * Se a API estiver indisponível, o campo continua funcionando e o endereço pode ser digitado à mão.
 */
export function CepInput({
  label = 'CEP',
  placeholder = '00000-000',
  value,
  onChange,
  onAddressFound,
  allowAddressSearch,
  error,
  hint,
  disabled,
  className,
  ...rest
}: CepInputProps) {
  const [buscaOpen, setBuscaOpen] = useState(false);
  const { status, endereco, error: lookupError } = useCepLookup(value, {
    onFound: onAddressFound,
    enabled: !!onAddressFound && !disabled,
  });

  const showSearch = allowAddressSearch ?? !!onAddressFound;

  const statusHint =
    status === 'loading'
      ? 'Consultando ViaCEP...'
      : status === 'success' && endereco
        ? `${endereco.logradouro ? `${endereco.logradouro}, ` : ''}${endereco.bairro ? `${endereco.bairro} – ` : ''}${endereco.cidade}/${endereco.uf}`
        : hint;

  return (
    <div className={className}>
      <MaskedInput
        mask={maskCep}
        label={label}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        error={error ?? lookupError}
        hint={statusHint}
        leftIcon={<MapPin size={16} />}
        rightSlot={
          status === 'loading' ? (
            <Loader2 size={16} className="animate-spin text-brand-600" />
          ) : status === 'success' ? (
            <CheckCircle2 size={16} className="text-emerald-600" />
          ) : undefined
        }
        {...rest}
      />
      {showSearch && !disabled && (
        <button type="button" onClick={() => setBuscaOpen(true)} className="mt-1 text-xs font-medium text-brand-700 hover:underline">
          Não sei meu CEP
        </button>
      )}
      {showSearch && (
        <BuscaCepModal
          open={buscaOpen}
          onClose={() => setBuscaOpen(false)}
          onSelect={(e) => {
            setBuscaOpen(false);
            // Preencher o campo dispara a busca automática, que chama onAddressFound (vem do cache).
            onChange(e.cep);
          }}
        />
      )}
    </div>
  );
}
