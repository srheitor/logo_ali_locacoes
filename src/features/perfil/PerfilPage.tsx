import type { FormEvent } from 'react';
import { useData } from '@/app/providers/DataProvider';
import { useCurrentUser } from '@/features/auth/AuthProvider';
import { atualizarUsuario } from '@/services/actions';
import { getEstudante, getProprietario, nomeCampus } from '@/services/queries';
import {
  CpfCnpjInput,
  CpfInput,
  DateOfBirthInput,
  EmailInput,
  PhoneInput,
  SelectInput,
  TextAreaInput,
  TextInput,
} from '@/shared/components/form';
import { useToast } from '@/shared/components/feedback/Toast';
import { Avatar, Badge, Button, Card, CardBody, CardHeader, PageHeader } from '@/shared/components/ui';
import { useForm } from '@/shared/hooks/useForm';
import {
  birthDateValidator,
  brDateToIso,
  cpfValidator,
  isoToBrDate,
  optional,
  phoneValidator,
  required,
  tipoUsuarioLabel,
} from '@/shared/utils';

/** Perfil do usuário logado — mesma tela para os três perfis, com seções específicas. */
export function PerfilPage() {
  const { db, run } = useData();
  const toast = useToast();
  const user = useCurrentUser();
  const estudante = getEstudante(db, user.id);
  const proprietario = getProprietario(db, user.id);

  const form = useForm(
    {
      nome: user.nome,
      telefone: user.telefone,
      cpf: user.cpf ?? '',
      nascimento: isoToBrDate(user.data_nascimento),
      campus: estudante?.campus_id ?? '',
      bio: estudante?.bio_preferencias ?? '',
    },
    {
      nome: [required()],
      telefone: [required(), phoneValidator],
      cpf: [optional(cpfValidator)],
      nascimento: [optional(birthDateValidator())],
    },
  );

  const salvar = (e: FormEvent) => {
    e.preventDefault();
    if (!form.validateAll()) return;
    const v = form.values;
    const r = run((d) =>
      atualizarUsuario(d, user.id, {
        nome: v.nome,
        telefone: v.telefone,
        cpf: v.cpf,
        data_nascimento: v.nascimento ? brDateToIso(v.nascimento) : undefined,
        ...(estudante ? { campus_id: v.campus, bio_preferencias: v.bio } : {}),
      }),
    );
    if (r.ok) toast.success('Perfil atualizado!');
    else toast.error(r.error);
  };

  return (
    <>
      <PageHeader title="Meu perfil" />
      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <Card className="flex flex-col items-center p-6 text-center lg:self-start">
          <Avatar name={user.nome} size="lg" />
          <h2 className="mt-3 font-semibold text-slate-900">{user.nome}</h2>
          <p className="text-sm text-slate-500">{user.email}</p>
          <div className="mt-3 flex flex-wrap justify-center gap-2">
            <Badge tone="teal">{tipoUsuarioLabel[user.tipo_usuario]}</Badge>
            {estudante && (estudante.verificado ? <Badge tone="green">Verificado</Badge> : <Badge tone="yellow">Não verificado</Badge>)}
          </div>
          {estudante && <p className="mt-3 text-xs text-slate-500">{nomeCampus(db, estudante.campus_id)} · Matrícula {estudante.matricula}</p>}
        </Card>

        <Card>
          <CardHeader title="Dados pessoais" />
          <CardBody>
            <form onSubmit={salvar} className="grid gap-4 sm:grid-cols-2" noValidate>
              <TextInput label="Nome completo" required className="sm:col-span-2" {...form.field('nome')} />
              <EmailInput value={user.email} onChange={() => {}} disabled hint="O e-mail de acesso não pode ser alterado." />
              <PhoneInput required {...form.field('telefone')} />
              <CpfInput {...form.field('cpf')} />
              <DateOfBirthInput {...form.field('nascimento')} />

              {estudante && (
                <>
                  <SelectInput
                    label="Campus onde estuda"
                    className="sm:col-span-2"
                    options={db.campi.map((c) => ({ value: c.id, label: nomeCampus(db, c.id) }))}
                    {...form.field('campus')}
                  />
                  <TextAreaInput label="Preferências de convivência" className="sm:col-span-2" rows={3} {...form.field('bio')} />
                </>
              )}
              {proprietario && (
                <CpfCnpjInput label="Documento do locador" className="sm:col-span-2" value={proprietario.documento} onChange={() => {}} disabled />
              )}

              <div className="flex justify-end sm:col-span-2">
                <Button type="submit">Salvar alterações</Button>
              </div>
            </form>
          </CardBody>
        </Card>
      </div>
    </>
  );
}
