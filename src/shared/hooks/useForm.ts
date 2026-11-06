import { useCallback, useState } from 'react';
import type { Validator } from '@/shared/utils';

type Values = Record<string, string>;
export type Rules<T extends Values> = Partial<Record<keyof T, Validator[]>>;

/**
 * Hook mínimo de formulário: guarda valores, erros e roda validadores.
 *
 * @example
 * const form = useForm({ cpf: '' }, { cpf: [required(), cpfValidator] });
 * <CpfInput {...form.field('cpf')} />
 * if (form.validateAll()) salvar(form.values);
 */
export function useForm<T extends Values>(initial: T, rules: Rules<T> = {}) {
  const [values, setValues] = useState<T>(initial);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});

  const runRules = useCallback(
    (name: keyof T, value: string) => {
      for (const rule of rules[name] ?? []) {
        const error = rule(value);
        if (error) return error;
      }
      return undefined;
    },
    [rules],
  );

  const setField = useCallback((name: keyof T, value: string) => {
    setValues((v) => ({ ...v, [name]: value }));
    setErrors((e) => ({ ...e, [name]: undefined }));
  }, []);

  /** Atalho para ligar um input: `<CpfInput {...field('cpf')} />` */
  const field = (name: keyof T) => ({
    value: values[name],
    onChange: (value: string) => setField(name, value),
    onBlur: () => setErrors((e) => ({ ...e, [name]: values[name] ? runRules(name, values[name]) : e[name] })),
    error: errors[name],
  });

  const validateAll = () => {
    const next: Partial<Record<keyof T, string>> = {};
    (Object.keys(rules) as Array<keyof T>).forEach((name) => {
      const error = runRules(name, values[name] ?? '');
      if (error) next[name] = error;
    });
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  return { values, setValues, errors, setErrors, setField, field, validateAll };
}
