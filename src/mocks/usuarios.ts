import type { Estudante, Proprietario, Usuario } from '@/shared/types/domain';
import { daysFromNow } from './helpers';

/**
 * Usuários de demonstração.
 * Logins rápidos: admin / aluno / proprietario — senha 123456 para todos.
 */
export const DEMO_SENHA = '123456';

const base = (dias: number) => ({ criado_em: daysFromNow(dias), atualizado_em: daysFromNow(dias) });

export const usuarios: Usuario[] = [
  {
    id: 'usr-admin',
    login: 'admin',
    nome: 'Mariana Costa',
    email: 'admin@logoali.com.br',
    senha: DEMO_SENHA,
    telefone: '(32) 99911-0001',
    cpf: '418.273.650-80',
    data_nascimento: '1990-03-14',
    tipo_usuario: 'ADMIN',
    ativo: true,
    ...base(-200),
  },
  {
    id: 'usr-aluno',
    login: 'aluno',
    nome: 'Ana Beatriz Souza',
    email: 'ana.souza@gmail.com',
    senha: DEMO_SENHA,
    telefone: '(31) 98822-3344',
    cpf: '702.615.384-62',
    data_nascimento: '2004-08-21',
    tipo_usuario: 'ESTUDANTE',
    ativo: true,
    ...base(-60),
  },
  {
    id: 'usr-aluno-2',
    login: 'pedro',
    nome: 'Pedro Henrique Lima',
    email: 'pedro.lima@gmail.com',
    senha: DEMO_SENHA,
    telefone: '(35) 99123-4567',
    cpf: '159.374.826-46',
    data_nascimento: '2005-01-09',
    tipo_usuario: 'ESTUDANTE',
    ativo: true,
    ...base(-20),
  },
  {
    id: 'usr-aluno-3',
    login: 'julia',
    nome: 'Júlia Ferreira',
    email: 'julia.ferreira@hotmail.com',
    senha: DEMO_SENHA,
    telefone: '(24) 99876-5432',
    cpf: '863.520.147-71',
    data_nascimento: '2003-11-30',
    tipo_usuario: 'ESTUDANTE',
    ativo: true,
    ...base(-35),
  },
  {
    id: 'usr-aluno-4',
    login: 'lucas',
    nome: 'Lucas Martins',
    email: 'lucas.martins@gmail.com',
    senha: DEMO_SENHA,
    telefone: '(32) 98456-1230',
    cpf: '295.038.461-70',
    data_nascimento: '2002-05-17',
    tipo_usuario: 'ESTUDANTE',
    ativo: true,
    ...base(-90),
  },
  {
    id: 'usr-aluno-5',
    login: 'rafael',
    nome: 'Rafael Oliveira',
    email: 'rafael.oliveira@gmail.com',
    senha: DEMO_SENHA,
    telefone: '(32) 99654-7788',
    cpf: '534.178.920-23',
    data_nascimento: '2001-02-02',
    tipo_usuario: 'ESTUDANTE',
    ativo: false,
    ...base(-120),
  },
  {
    id: 'usr-prop',
    login: 'proprietario',
    nome: 'Carlos Eduardo Ribeiro',
    email: 'carlos.ribeiro@gmail.com',
    senha: DEMO_SENHA,
    telefone: '(32) 99988-7766',
    cpf: '681.249.035-06',
    data_nascimento: '1975-09-05',
    tipo_usuario: 'PROPRIETARIO',
    ativo: true,
    ...base(-180),
  },
  {
    id: 'usr-prop-2',
    login: 'residencial',
    nome: 'Residencial Universitário JF Ltda.',
    email: 'contato@residencialjf.com.br',
    senha: DEMO_SENHA,
    telefone: '(32) 3215-4400',
    tipo_usuario: 'PROPRIETARIO',
    ativo: true,
    ...base(-150),
  },
];

export const estudantes: Estudante[] = [
  {
    usuario_id: 'usr-aluno',
    campus_id: 'cmp-ufjf-sede',
    matricula: '202365012',
    verificado: true,
    bio_preferencias: 'Estudo Engenharia Computacional. Prefiro lugares silenciosos e com boa internet.',
    criado_em: daysFromNow(-60),
  },
  {
    usuario_id: 'usr-aluno-2',
    campus_id: 'cmp-ufjf-sede',
    matricula: '202465101',
    verificado: false,
    bio_preferencias: 'Calouro de Direito, vindo de Varginha.',
    criado_em: daysFromNow(-20),
  },
  {
    usuario_id: 'usr-aluno-3',
    campus_id: 'cmp-uniacademia',
    matricula: 'UA2023-4471',
    verificado: false,
    bio_preferencias: 'Psicologia. Tenho um gato.',
    criado_em: daysFromNow(-35),
  },
  {
    usuario_id: 'usr-aluno-4',
    campus_id: 'cmp-ufjf-hu',
    matricula: '202155033',
    verificado: true,
    bio_preferencias: 'Medicina, internato no HU.',
    criado_em: daysFromNow(-90),
  },
  {
    usuario_id: 'usr-aluno-5',
    campus_id: 'cmp-ufjf-sede',
    matricula: '202065200',
    verificado: false,
    criado_em: daysFromNow(-120),
  },
];

export const proprietarios: Proprietario[] = [
  { usuario_id: 'usr-prop', documento: '681.249.035-06', criado_em: daysFromNow(-180) },
  { usuario_id: 'usr-prop-2', documento: '34.287.156/0001-17', criado_em: daysFromNow(-150) },
];
