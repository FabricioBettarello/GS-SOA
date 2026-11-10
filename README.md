# AlagaAlerta API

Backend da CitizenTech AlagaAlerta para a disciplina de Arquitetura Orientada a Serviços (SOA) e Web Services.
Global Solution FIAP 2026.2, Engenharia de Software, 3º ano.

## Ficha da CitizenTech

| Campo | Resposta |
|---|---|
| **Nome da CitizenTech** | AlagaAlerta |
| **Cidade e bairro** | São Paulo, SP: Pompeia, Sé (Praça da Bandeira) e Aricanduva *(ajustar para o bairro que a equipe observou)* |
| **Cidadão beneficiado** | Quem mora, trabalha ou passa por ruas que alagam: pedestres, motoristas de app, idosos e moradores de baixadas |
| **Problema, em uma frase** | Quem passa por pontos que alagam só descobre a água subindo quando já está no meio dela, sem aviso e sem alternativa. |
| **Como funciona** | Um sensor ESP32 mede o nível da água no ponto de risco e envia para a API; a API classifica o risco e abre, escala ou encerra alertas automaticamente; o cidadão consulta os alertas e relata alagamentos pelo app. |
| **O que cada parte faz** | **SOA (este repo):** API REST + banco. **C#:** Web API .NET 8 com EF Core (`alagaalerta-dotnet`) com o mesmo domínio e um painel de indicadores por bairro. **Mobile:** app Expo que consome esta API. **Physical Computing:** ESP32 + sensor ultrassônico no Wokwi que chama `POST /leituras`. **IA/ML:** modelo de risco com dados reais de chuva (INMET/CGE). **Operating Systems:** VM Linux que provisiona e hospeda esta API. **Cybersecurity:** regras PII sobre os relatos. **Testing:** Features e Test Cases no Azure Boards. |
| **Link do repositório** | *(colar o link do GitHub)* |
| **Indicador de impacto** | Tempo entre a água atingir o nível de atenção e o alerta chegar ao cidadão; nº de alertas emitidos por ponto; relatos confirmados por bairro. |
| **ODS conectados** | **ODS 11** (cidades resilientes, meta 11.5: reduzir pessoas afetadas por desastres), **ODS 13** (adaptação a eventos climáticos extremos, meta 13.1), **ODS 9** (infraestrutura com tecnologia). |

## Integrantes

| Nome | RM |
|---|---|
| Enzo Miletta | 98677 |
| Fabricio Bettarello | 554638 |
| Renato Luiz Cordão | 556403 |
| Victoria Moura | 555474 |
| Vitor Victorino Couto | 554965 |

## Stack

- **Node.js 20+ e TypeScript** (Express)
- **PostgreSQL 16** com **Prisma ORM** (conexão, repositórios e **migrações versionadas**)
- **Zod** para validação + **zod-to-openapi** para gerar a documentação **automaticamente**
- **Swagger UI** em `/docs`
- **Vitest + Supertest** para testes automatizados (unitários e de integração)
- **Docker Compose** para subir banco e API

## Arquitetura

```
src/
├── domain/        entidades, regra de alerta, erros e interfaces dos repositórios
├── application/   serviços (casos de uso)
├── infra/
│   ├── prisma/    repositórios com PostgreSQL
│   └── memory/    repositórios em memória para os testes
├── http/          rotas, schemas Zod, OpenAPI e tratamento de erros
├── app.ts
└── server.ts
prisma/
├── schema.prisma
├── migrations/    init e add_relatos
└── seed.ts
tests/             unitários e de integração
```

Os serviços recebem os repositórios pelo construtor. Na API rodando são os do Prisma e nos testes são os de memória, então os testes não precisam de banco.

### Regra de negócio principal

Cada ponto de risco tem dois limites: `nivelAtencaoCm` e `nivelCriticoCm`. A cada leitura do sensor:

| Nível da água | Situação | O que acontece com o alerta |
|---|---|---|
| abaixo da atenção | NORMAL | encerra o alerta ativo, se houver |
| ≥ atenção e < crítico | ATENÇÃO | cria um alerta (ou mantém, se já existir) |
| ≥ crítico | CRÍTICO | cria um alerta ou escala o de ATENÇÃO |

Nunca existem dois alertas ativos no mesmo ponto, e as mensagens usam linguagem simples para leitura no celular.

## Como executar

### Opção 1: tudo com Docker

```bash
docker compose up --build
docker compose exec api npx prisma db seed
```

### Opção 2: API local + banco no Docker

```bash
cp .env.example .env
docker compose up -d db
npm install
npm run db:migrate
npm run db:seed
npm run dev
```

- Swagger: <http://localhost:3000/docs>
- OpenAPI (JSON): <http://localhost:3000/docs.json>
- Health check: <http://localhost:3000/health>

### Simular uma chuva forte (ESP32)

Com a API rodando e o seed aplicado:

```bash
npm run simular -- ESP32-POMPEIA-01
```

A água sobe, o alerta abre em ATENÇÃO, escala para CRÍTICO e é encerrado quando a água baixa.

### Testes

```bash
npm test
```

Os testes cobrem a regra de classificação, a abertura, escalonamento e encerramento de alertas, as validações dos serviços e o fluxo HTTP completo (status 201/400/404/409/422 e a documentação gerada).

## Endpoints (`/api/v1`)

| Método | Rota | Descrição |
|---|---|---|
| POST | `/bairros` | Cadastra bairro |
| GET | `/bairros` · `/bairros/{id}` | Lista / busca bairros |
| POST | `/pontos-risco` | Cadastra ponto que alaga (com limites) |
| GET | `/pontos-risco?bairroId=` · `/pontos-risco/{id}` | Lista / busca pontos |
| PATCH / DELETE | `/pontos-risco/{id}` | Atualiza / remove ponto |
| GET | `/pontos-risco/{id}/status` | Situação atual do ponto (para o app) |
| POST | `/sensores` | Cadastra sensor ESP32 |
| GET | `/sensores?pontoRiscoId=` | Lista sensores |
| PATCH | `/sensores/{id}` | Ativa/desativa sensor |
| GET | `/sensores/{id}/leituras?limite=` | Histórico de leituras |
| POST | `/leituras` | **Recebe a medição do ESP32 e avalia o alerta** |
| GET | `/alertas?ativos=true&bairroId=` | Lista alertas |
| POST | `/relatos` | Cidadão relata alagamento |
| GET | `/relatos?bairroId=&status=` | Lista relatos |
| PATCH | `/relatos/{id}/status` | Confirma ou descarta relato |

Os erros seguem sempre o formato `{ "erro": "...", "detalhes": [{ "campo", "mensagem" }] }`.

## Como o projeto atende à avaliação

| Critério | Peso | Onde está |
|---|---|---|
| Estruturação do domínio | 3,0 | `src/domain` (entidades, regras puras, erros e contratos), `src/application` (casos de uso), separação em camadas |
| Conexão com banco de dados | 3,0 | PostgreSQL via Prisma, `src/infra/prisma`, relacionamentos, índices e chaves estrangeiras |
| Migrações | 1,5 | `prisma/migrations`: `init` e `add_relatos`, aplicadas com `npm run db:migrate` |
| Documentação automática | 1,5 | OpenAPI gerada dos schemas Zod (`src/http/openapi.ts`), Swagger em `/docs` |
| Testes automatizados | 1,0 | `tests/unit` e `tests/integration` com Vitest + Supertest |

## Dados e privacidade

- Os relatos **não guardam dados pessoais** (nem nome, nem telefone): apenas bairro, descrição, intensidade e localização opcional.
- Leituras e coordenadas do seed são **simuladas/aproximadas**, apenas para demonstração.
- O uso de IA está registrado em [`prompts.md`](prompts.md).

## Evidências

Os prints e a descrição de cada um estão em [`docs/evidencias`](docs/evidencias).
