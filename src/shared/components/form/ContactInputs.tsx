import { useState } from 'react';
import { Eye, EyeOff, Lock, Mail, Phone } from 'lucide-react';
import { maskPhone } from '@/shared/utils';
import { MaskedInput, type SpecializedInputProps } from './MaskedInput';
import { TextInput } from './TextInput';

/** Telefone fixo ou celular: (00) 0000-0000 / (00) 00000-0000. */
export function PhoneInput({ label = 'Telefone', placeholder = '(00) 00000-0000', ...rest }: SpecializedInputProps) {
  return (
    <MaskedInput mask={maskPhone} label={label} placeholder={placeholder} leftIcon={<Phone size={16} />} {...rest} />
  );
}

export function EmailInput({ label = 'E-mail', placeholder = 'voce@exemplo.com', ...rest }: SpecializedInputProps) {
  return (
    <TextInput
      type="email"
      autoComplete="email"
      label={label}
      placeholder={placeholder}
      leftIcon={<Mail size={16} />}
      {...rest}
    />
  );
}

/** Senha com botão para mostrar/ocultar. */
export function PasswordInput({ label = 'Senha', placeholder = '••••••', ...rest }: SpecializedInputProps) {
  const [visible, setVisible] = useState(false);
  return (
    <TextInput
      type={visible ? 'text' : 'password'}
      label={label}
      placeholder={placeholder}
      leftIcon={<Lock size={16} />}
      rightSlot={
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="rounded p-1 text-slate-400 hover:text-slate-600"
          aria-label={visible ? 'Ocultar senha' : 'Mostrar senha'}
        >
          {visible ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      }
      {...rest}
    />
  );
}
