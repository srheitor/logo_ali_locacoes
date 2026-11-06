# Logo Alí · Locações para estudantes

Esboço da plataforma web de locação de imóveis para universitários (Projeto A3 – Banco de Dados).
Documentação completa: <https://adriano-projects.gitbook.io/logo-ali-documentacao/>

> **Versão de apresentação:** todos os dados são **mockados** (em memória + `localStorage`).
> A camada de dados foi isolada para ser trocada pelo Supabase/PostgreSQL depois, sem mexer nas telas.

## Como rodar

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # checagem de tipos + build de produção
```

### Publicação no GitHub Pages

O deploy é automático pelo workflow `.github/workflows/deploy.yml` a cada push na `main` (ou manualmente em **Actions → Deploy GitHub Pages → Run workflow**).

Configuração única no repositório: **Settings → Pages → Build and deployment → Source: "GitHub Actions"**.

> Não use "Deploy from a branch": isso publica o código-fonte sem compilar e a página fica em branco.

O workflow compila com `BASE_PATH=/<nome-do-repo>/` (o site fica numa subpasta) e cria um `404.html` para que links diretos como `/aluno/favoritos` funcionem.

### Usuários de demonstração (senha `123456`)

| Login          | Perfil        | Quem é                                       |
| -------------- | ------------- | -------------------------------------------- |
| `aluno`        | Aluno         | Ana Beatriz – UFJF Campus Sede (verificada)  |
| `proprietario` | Proprietário  | Carlos Eduardo (pessoa física)               |
| `admin`        | Administrador | Mariana Costa                                |
| `pedro`, `julia`, `lucas` | Aluno | outros cenários (verificação pendente, reprovada…) |
| `residencial`  | Proprietário  | Residencial Universitário JF Ltda. (CNPJ)    |

Na tela de login há botões de **acesso rápido** para os três perfis. No menu lateral, **“Restaurar dados da demo”** volta tudo ao estado inicial.

## Stack

React 18 + TypeScript + Vite · Tailwind CSS · React Router · Leaflet/OpenStreetMap (mapa) · lucide-react (ícones) · ViaCEP (busca de endereço pelo CEP).

## Organização das pastas

```
src/
├── app/                      # "Cola" da aplicação
│   ├── App.tsx               # Providers (dados → auth → toasts → rotas)
│   ├── routes.tsx            # Todas as rotas, agrupadas por perfil
│   ├── layouts/RoleLayout.tsx# Menu lateral de cada perfil
│   └── providers/DataProvider.tsx  # "Banco" mockado (trocar pelo Supabase aqui)
│
├── shared/                   # ♻️ Reutilizável em qualquer tela — sem regra de negócio
│   ├── components/
│   │   ├── form/             # Inputs: CpfInput, CnpjInput, CpfCnpjInput, DateOfBirthInput,
│   │   │                     #   CepInput + BuscaCepModal (ViaCEP), PhoneInput, EmailInput, PasswordInput,
│   │   │                     #   CurrencyInput, SelectInput, TextAreaInput, Toggle,
│   │   │                     #   PhotoUploader, MaskedInput (base), FormField (wrapper)
│   │   ├── ui/               # Button, Card, Badge (+ badges de status), Modal, Tabs,
│   │   │                     #   StatCard, EmptyState, Avatar, StarRating, BarList, PageHeader
│   │   ├── feedback/         # Toast (notificações) e PromptModal (motivo/justificativa)
│   │   └── layout/           # AppLayout (sidebar responsiva) e Logo
│   ├── hooks/                # useForm (estado + validação) e useCepLookup (CEP → endereço)
│   ├── services/viacep.ts    # Integração ViaCEP: busca por CEP e por endereço, com cache e timeout
│   ├── types/domain.ts       # Tipos espelhando o Modelo Lógico (17 tabelas)
│   └── utils/                # masks, validators (CPF/CNPJ/CEP/data…), formatters, geo (Haversine)
│
├── services/                 # Acesso a dados
│   ├── queries.ts            # Leituras (equivalem aos SELECTs da seção 16)
│   └── actions.ts            # Escritas + regras de negócio RN01–RN09
│
├── mocks/                    # Seed fictício (Juiz de Fora / UFJF / UniAcademia)
│
└── features/                 # Telas, agrupadas por domínio
    ├── auth/                 # Login, cadastro, proteção de rotas por perfil
    ├── aluno/                # Busca (lista + mapa), detalhe, favoritos, visitas, verificação
    ├── proprietario/         # Painel, meus anúncios, formulário de anúncio, visitas recebidas
    ├── admin/                # Painel/relatórios, moderação, verificações, usuários
    ├── anuncios/components/  # Card, mapa, galeria, seletor de localização (usados por vários perfis)
    ├── visitas/              # VisitaCard (aluno e proprietário)
    ├── chat/                 # Chat interno (aluno e proprietário)
    └── perfil/               # Perfil (todos os perfis)
```

**Regra prática:** se o componente não sabe nada sobre "anúncio", "visita" ou "aluno", ele vai em `shared/`.
Se é específico do domínio mas usado por mais de um perfil, fica em `features/<domínio>/`.

### Exemplo de uso dos inputs compartilhados

```tsx
import { CpfInput, DateOfBirthInput, CepInput } from '@/shared/components/form';
import { useForm } from '@/shared/hooks/useForm';
import { required, cpfValidator, birthDateValidator } from '@/shared/utils';

const form = useForm({ cpf: '', nascimento: '', cep: '' }, {
  cpf: [required(), cpfValidator],
  nascimento: [required(), birthDateValidator(16)],
});

<CpfInput required {...form.field('cpf')} />
<DateOfBirthInput {...form.field('nascimento')} />
<CepInput {...form.field('cep')} onAddressFound={(end) => console.log(end.logradouro)} />
```

## Integração com o ViaCEP

`src/shared/services/viacep.ts` concentra as chamadas à API pública [ViaCEP](https://viacep.com.br) (sem chave):

- **CEP → endereço** (`buscarEnderecoPorCep`): usado automaticamente pelo `CepInput` ao digitar 8 dígitos; preenche rua, bairro, cidade e UF e leva o foco para o campo "Número".
- **Endereço → CEP** (`buscarCepsPorEndereco`): link **"Não sei meu CEP"** abaixo do campo (UF + cidade + rua, mínimo 3 letras).
- Trata CEP inválido, CEP inexistente (`erro: "true"`), timeout de 8 s e API fora do ar — nesses casos o endereço pode ser digitado à mão.
- Resultados ficam em cache durante a sessão; requisições antigas são canceladas se o usuário continuar digitando.

```tsx
const { status, endereco, error } = useCepLookup(cep, { onFound: (e) => preencher(e) });
```

## Requisitos cobertos no esboço

| Requisito | Onde |
| --- | --- |
| RF01 Cadastro com perfis | `features/auth/pages/CadastroPage.tsx` |
| RF02 Universidade e campus | Cadastro e perfil do aluno |
| RF03 Cadastro de imóvel (mín. 3 fotos) | `proprietario/pages/AnuncioFormPage.tsx` |
| RF04 Distância e tempo até o campus | `shared/utils/geo.ts` + `DeslocamentoInfo` |
| RF05 Filtros de busca | `aluno/pages/BuscaPage.tsx` |
| RF06 Lista e mapa interativo | `anuncios/components/AnunciosMap.tsx` |
| RF07 Favoritos | `aluno/pages/FavoritosPage.tsx` |
| RF08 Chat interno | `features/chat/ChatPage.tsx` |
| RF09 / RN01 Verificação de vínculo | `aluno/pages/VerificacaoPage.tsx`, `admin/pages/VerificacoesPage.tsx` |
| RF10 Painel admin (moderação, usuários, relatórios) | `features/admin/` |
| RF11 / RN02 Agendamento de visitas | `AgendarVisitaModal`, `MinhasVisitasPage`, `VisitasRecebidasPage` |
| RN03 Expiração e repostagem | `executarRotinaExpiracao` (botão no painel admin) |
| RN06 / RN07 Fotos e valor | validações em `services/actions.ts` |
| RN09 Avaliações | detalhe do anúncio (só após visita realizada) |

## Próximos passos

- Trocar `DataProvider` + `services/` por chamadas ao **Supabase** (Auth, tabelas, Storage).
- `cpf` e `data_nascimento` foram adicionados ao usuário no protótipo — avaliar incluí-los no modelo lógico.
- Substituir a estimativa de tempo de deslocamento por uma API de rotas real.
