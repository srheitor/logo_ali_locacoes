import { useMemo, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Building2, GraduationCap } from 'lucide-react';
import { useData } from '@/app/providers/DataProvider';
import { cadastrarUsuario } from '@/services/actions';
import {
  CpfCnpjInput,
  CpfInput,
  DateOfBirthInput,
  EmailInput,
  PasswordInput,
  PhoneInput,
  SelectInput,
  TextInput,
} from '@/shared/components/form';
import { useToast } from '@/shared/components/feedback/Toast';
import { Logo } from '@/shared/components/layout/Logo';
import { Button, Card } from '@/shared/components/ui';
import { useForm } from '@/shared/hooks/useForm';
import {
  birthDateValidator,
  brDateToIso,
  cn,
  cpfCnpjValidator,
  cpfValidator,
  emailValidator,
  phoneValidator,
  required,
  type Validator,
} from '@/shared/utils';
import { homeByRole, useAuth } from '../AuthProvider';

type Perfil = 'ESTUDANTE' | 'PROPRIETARIO';

const initial = {
  nome: '',
  email: '',
  telefone: '',
  cpf: '',
  nascimento: '',
  instituicao: '',
  campus: '',
  matricula: '',
  documento: '',
  senha: '',
  confirmar: '',
};

export function CadastroPage() {
  const { db, run } = useData();
  const { loginAs } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [perfil, setPerfil] = useState<Perfil>('ESTUDANTE');

  const minSenha: Validator = (v) => (v.length >= 6 ? undefined : 'Mínimo de 6 caracteres');

  // As regras mudam conforme o perfil escolhido.
  const rules = useMemo(
    () => ({
      nome: [required()],
      email: [required(), emailValidator],
      telefone: [required(), phoneValidator],
      cpf: [required(), cpfValidator],
      nascimento: [required(), birthDateValidator(perfil === 'ESTUDANTE' ? 16 : 18)],
      senha: [required(), minSenha],
      ...(perfil === 'ESTUDANTE'
        ? { instituicao: [required('Selecione a instituição')], campus: [required('Selecione o campus')], matricula: [required()] }
        : { documento: [required(), cpfCnpjValidator] }),
    }),
    [perfil],
  );

  const form = useForm(initial, rules);
  const { values } = form;

  const campusOptions = db.campi
    .filter((c) => c.instituicao_id === values.instituicao)
    .map((c) => ({ value: c.id, label: c.nome }));

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const valid = form.validateAll();
    if (values.senha !== values.confirmar) {
      form.setErrors((err) => ({ ...err, confirmar: 'As senhas não conferem' }));
      return;
    }
    if (!valid) return;

    const result = run((d) =>
      cadastrarUsuario(d, {
        tipo: perfil,
        nome: values.nome,
        email: values.email,
        senha: values.senha,
        telefone: values.telefone,
        cpf: values.cpf,
        data_nascimento: brDateToIso(values.nascimento),
        campus_id: values.campus,
        matricula: values.matricula,
        documento: values.documento || values.cpf,
      }),
    );
    if (!result.ok) return toast.error(result.error);
    toast.success('Conta criada com sucesso!');
    loginAs(result.data);
    navigate(perfil === 'ESTUDANTE' ? '/aluno/verificacao' : homeByRole[perfil]);
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-2xl">
        <Link to="/login">
          <Logo className="mb-6" />
        </Link>
        <Card className="p-6 sm:p-8">
          <h1 className="text-2xl font-bold text-slate-900">Criar conta</h1>
          <p className="mt-1 text-sm text-slate-500">Escolha o tipo de perfil (RF01).</p>

          <div className="mt-6 grid grid-cols-2 gap-3">
            {(
              [
                { v: 'ESTUDANTE', label: 'Sou estudante', desc: 'Quero encontrar moradia', icon: <GraduationCap /> },
                { v: 'PROPRIETARIO', label: 'Sou proprietário', desc: 'Quero anunciar imóveis', icon: <Building2 /> },
              ] as const
            ).map((o) => (
              <button
                key={o.v}
                type="button"
                onClick={() => setPerfil(o.v)}
                className={cn(
                  'flex items-center gap-3 rounded-xl border-2 p-4 text-left transition',
                  perfil === o.v ? 'border-brand-500 bg-brand-50' : 'border-slate-200 hover:border-slate-300',
                )}
              >
                <span className={perfil === o.v ? 'text-brand-600' : 'text-slate-400'}>{o.icon}</span>
                <span>
                  <span className="block text-sm font-semibold text-slate-900">{o.label}</span>
                  <span className="block text-xs text-slate-500">{o.desc}</span>
                </span>
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="mt-6 grid gap-4 sm:grid-cols-2" noValidate>
            <TextInput label="Nome completo" required className="sm:col-span-2" {...form.field('nome')} />
            <EmailInput required {...form.field('email')} />
            <PhoneInput required {...form.field('telefone')} />
            <CpfInput required {...form.field('cpf')} />
            <DateOfBirthInput required {...form.field('nascimento')} />

            {perfil === 'ESTUDANTE' ? (
              <>
                <SelectInput
                  label="Instituição de ensino"
                  required
                  placeholder="Selecione..."
                  options={db.instituicoes.map((i) => ({ value: i.id, label: `${i.sigla} – ${i.nome}` }))}
                  {...form.field('instituicao')}
                  onChange={(v) => {
                    form.setField('instituicao', v);
                    form.setField('campus', '');
                  }}
                />
                <SelectInput
                  label="Campus"
                  required
                  placeholder={values.instituicao ? 'Selecione...' : 'Escolha a instituição'}
                  disabled={!values.instituicao}
                  options={campusOptions}
                  {...form.field('campus')}
                />
                <TextInput label="Matrícula" required className="sm:col-span-2" {...form.field('matricula')} />
              </>
            ) : (
              <CpfCnpjInput
                label="Documento do locador (CPF ou CNPJ)"
                required
                className="sm:col-span-2"
                hint="Pessoa física ou jurídica (imobiliária, pensão)."
                {...form.field('documento')}
              />
            )}

            <PasswordInput required {...form.field('senha')} />
            <PasswordInput label="Confirmar senha" required {...form.field('confirmar')} />

            <div className="flex flex-col-reverse gap-3 pt-2 sm:col-span-2 sm:flex-row sm:justify-between">
              <Link to="/login" className="text-center text-sm text-slate-500 hover:text-slate-700 sm:self-center">
                Já tenho conta
              </Link>
              <Button type="submit" size="lg">
                Criar conta
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
