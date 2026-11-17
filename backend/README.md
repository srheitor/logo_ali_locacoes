# Logo Alí · Backend

API REST da plataforma (Node.js + Express + TypeScript) sobre o banco **PostgreSQL do Supabase** criado pelo grupo
(17 tabelas em MAIÚSCULAS: `USUARIO`, `ANUNCIO`, `VISITA`…).

```
Front (React)  ──HTTP/JSON──▶  Backend (Express)  ──chave secreta──▶  Supabase (Postgres + Storage)
                 Bearer JWT       bcrypt + JWT próprios                  (API REST / PostgREST)
```

- **Autenticação própria:** a senha fica em `USUARIO.senha_hash` (bcrypt, RNF03). O login devolve um `access_token` (1 h), enviado em `Authorization: Bearer`, e um `refresh_token` (7 dias). O schema não referencia o Supabase Auth.
- **Dados:** o backend acessa o banco com a chave secreta (ignora a RLS) e aplica as permissões por perfil.
- **Regras de negócio no backend:** o schema não tem valores padrão, triggers nem funções. Por isso o backend gera ids e datas e aplica as regras RN01–RN11 (validação com zod + services). Operações em várias tabelas não têm transação pela API REST e usam compensação: se um passo falha, os anteriores são desfeitos.

## Configuração

```bash
cp .env.example .env      # preencher SUPABASE_URL, SUPABASE_SECRET_KEY e JWT_SECRET
npm install
npm run setup:storage     # uma vez: cria os buckets avatars, anuncios e documentos
npm run seed              # opcional: dados de demonstração (senha 123456)
npm run dev               # http://localhost:3333/api
```

| Script | O que faz |
| --- | --- |
| `npm run dev` | Servidor com *reload* (tsx watch) |
| `npm run build` / `npm start` | Compila para `dist/` e executa |
| `npm run typecheck` | Checagem de tipos |
| `npm run seed` | Povoa com os mocks do front (`src/mocks`). Idempotente |
| `npm run seed -- --limpar` | Remove os dados de demonstração e o que os usuários de demo criaram |
| `npm run setup:storage` | Cria os buckets do Storage (idempotente) |

## Estrutura

```
backend/
├── src/
│   ├── server.ts / app.ts      # bootstrap e montagem das rotas
│   ├── config/env.ts           # variáveis de ambiente validadas
│   ├── lib/                    # supabase (nomes das tabelas, ids/datas), tokens JWT, erros, validação, geo
│   ├── middlewares/            # authenticate/requireRole, tratamento de erros
│   ├── types/domain.ts         # tipos espelhando as tabelas
│   └── modules/<domínio>/      # *.routes.ts (HTTP) + *.service.ts (regras + banco) + *.schemas.ts
└── scripts/                    # seed.ts e setup-storage.ts
```

Nas consultas com relacionamentos, as tabelas em maiúsculas recebem apelidos em minúsculas
(`fotos:FOTO_ANUNCIO(url, ordem)`), para o JSON da API ficar todo em snake_case.

## Endpoints (`/api`)

Respostas de erro: `{ "error": "mensagem", "details"?: ... }`, com 400 para validação, 401 sem login, 403 sem permissão, 404 quando o registro não existe, 409 para conflito e 422 para regra de negócio.

| Método | Rota | Perfil | Descrição |
| --- | --- | --- | --- |
| POST | `/auth/cadastro` | público | RF01, estudante (com `campus_id`) ou proprietário (com `documento`) |
| POST | `/auth/login` | público | `{ email, senha }` → `{ sessao, usuario, estudante, proprietario }` |
| POST | `/auth/refresh` | público | `{ refresh_token }` → nova sessão |
| POST | `/auth/logout` | logado | o front descarta os tokens (não há tabela de sessões) |
| GET | `/auth/me` | logado | perfil completo |
| PATCH | `/usuarios/me` | logado | atualiza perfil (bio/campus só para estudante) |
| GET | `/usuarios` · PATCH `/usuarios/:id/ativo` | admin | lista (`tipo`, `ativo`, `busca`) / bloqueia ou desbloqueia |
| GET | `/instituicoes`, `/campi`, `/comodidades` | público | catálogo |
| GET | `/anuncios` | público | busca (RF05, RN08). Filtros: `valor_min`, `valor_max`, `tipo`, `mobiliado`, `disponibilidade_imediata`, `quartos_min`, `comodidade`, `campus_id`, `distancia_max_km`, `q`, `ordenar`, `pagina`, `limite` |
| GET | `/anuncios/:id` | público* | detalhe (*não publicados: dono, admin ou estudante que interagiu) |
| POST | `/anuncios/:id/visualizacao` | público | +1 visualização |
| GET | `/anuncios/meus` | proprietário | anúncios com favoritos, visitas e última moderação |
| POST / PUT | `/anuncios`, `/anuncios/:id` | proprietário | cria ou edita (RN05–RN07). Novo anúncio entra em moderação |
| PATCH | `/anuncios/:id/status` | proprietário/admin | `DISPONIVEL`/`ALUGADO`/`INDISPONIVEL` |
| POST | `/anuncios/:id/renovar` | proprietário | RN03.3, +30 dias |
| DELETE | `/anuncios/:id` | proprietário/admin | recusado (409) se houver histórico |
| GET / PUT | `/anuncios/:id/avaliacoes` | público / estudante | RN09: só quem tem visita `REALIZADA` |
| GET · PUT/DELETE | `/favoritos` · `/favoritos/:anuncioId` | estudante | RF07 |
| GET · POST | `/verificacoes/minhas` · `/verificacoes` | estudante | RN01: e-mail + documento ⇒ aprovação automática |
| GET · POST | `/verificacoes?status=` · `/verificacoes/:id/analise` | admin | análise com link temporário do documento |
| GET · POST | `/visitas` | logado · estudante | agenda / solicitação (RN02) |
| PATCH | `/visitas/:id/status` | estudante/proprietário | confirmar, recusar, realizar ou cancelar (motivo vai para `observacao`) |
| GET / POST | `/conversas` | estudante/proprietário | lista com não lidas / inicia (estudante) |
| GET / POST | `/conversas/:id/mensagens` · POST `/conversas/:id/lida` | participantes | RN04 |
| POST | `/uploads` | logado | `{ bucket, extensao }` → URL assinada para enviar o arquivo direto ao Storage |
| GET · POST | `/admin/anuncios` · `/admin/anuncios/:id/moderacao` | admin | RF10, moderação |
| GET | `/admin/moderacoes`, `/admin/relatorios` | admin | consultas 3, 4 e 9 + contagens |
| POST | `/admin/rotinas/expiracao` | admin | RN03 (republica vencidos aprovados; não mexe em `ALUGADO`/`INDISPONIVEL`) |

## Adaptações ao schema atual

| O front/documentação prevê | No banco atual | Como o backend trata |
| --- | --- | --- |
| `cep`, `bairro`, `cidade`, `uf` no anúncio | só `endereco` | aceita os campos e monta o texto: `Rua X, 10 – Bairro – Cidade/UF – CEP …` |
| `cpf`, `data_nascimento` no usuário | não existem | não são gravados |
| motivo do cancelamento ou recusa da visita (RN02.2) | sem coluna | anexado em `observacao` com autor e data |
| `FAVORITO.id` | PK composta | usa `(estudante_id, anuncio_id)` |
| `DEFAULT`, `UNIQUE` e triggers | ausentes ou não confirmados | ids e datas gerados no backend. Unicidade (e-mail, visita ativa, avaliação) e `verificado` checados no código |
