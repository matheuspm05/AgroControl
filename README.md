# AgroControl

Sistema web para gerenciamento operacional de fazendas, com foco em cadastro, acompanhamento e controle dos principais módulos do dia a dia rural.

## Visão geral

O projeto é dividido em duas aplicações:

- `frontend/FrontEndAgro`: interface web em React + Vite
- `backend/ApiAgro`: API REST em ASP.NET Core + PostgreSQL

Hoje a base já cobre os fluxos principais da aplicação:

- autenticação com login e cadastro
- criação e gestão da fazenda do usuário
- animais, pastos, currais, remédios e campeiros
- movimentação de animais entre locais
- aplicação de remédios
- dashboard, relatórios iniciais, perfil e configurações

## Stack

- Frontend: `React`, `Vite`, `React Router`, `Tailwind CSS 4`
- Backend: `ASP.NET Core 9`, `Entity Framework Core`, `Npgsql`
- Banco de dados: `PostgreSQL`
- Containerização: `Docker` para o backend

## Segurança e sessão

- autenticação com `JWT`
- `access token` curto
- `refresh token` com rotação e revogação server-side
- cookie `HttpOnly` para refresh de sessão
- validação obrigatória de `CORS` fora de desenvolvimento
- validação de chave JWT mínima para produção

As configurações sensíveis não ficam versionadas no repositório. Tudo que envolve chave, banco ou origens de frontend deve ser fornecido por variável de ambiente.

## Estrutura

```txt
AgroTech/
├── backend/
│   ├── ApiAgro/
│   │   ├── Controllers/
│   │   ├── DTOs/
│   │   ├── Data/
│   │   ├── Migrations/
│   │   ├── Models/
│   │   ├── Services/
│   │   └── Dockerfile
│   └── ApiAgro.Tests/
├── frontend/
│   └── FrontEndAgro/
├── docs/
└── README.md
```

## Como rodar localmente

### Backend

Pré-requisitos:

- `.NET SDK 9`
- `PostgreSQL`

Variáveis obrigatórias:

```bash
export Jwt__Key="SUA_CHAVE_COM_PELO_MENOS_32_BYTES"
export ConnectionStrings__DefaultConnection="SUA_CONNECTION_STRING"
```

Rodando a API:

```bash
cd backend/ApiAgro
dotnet run --launch-profile Dev
```

Endpoints locais padrão:

- API: `http://localhost:5001/api`
- Auth: `http://localhost:5001/auth`
- Swagger: `http://localhost:5001/swagger`

### Frontend

Pré-requisitos:

- `Node.js`
- `npm`

Rodando o frontend:

```bash
cd frontend/FrontEndAgro
npm install
npm run dev
```

URL local padrão:

- Frontend: `http://localhost:5173`

Por padrão, o frontend aponta para:

```txt
http://localhost:5001/api
```

## Banco de dados e migrations

Para aplicar as migrations no banco configurado:

```bash
cd backend/ApiAgro
dotnet ef database update
```

Se `dotnet ef` não estiver instalado:

```bash
dotnet tool install --global dotnet-ef --version "9.*"
```

## Docker do backend

O backend possui `Dockerfile` próprio em [backend/ApiAgro/Dockerfile](/home/matheus/Projetos/AgroTech/backend/ApiAgro/Dockerfile).

Build da imagem:

```bash
cd /home/matheus/Projetos/AgroTech
docker build -f backend/ApiAgro/Dockerfile -t agrocontrol-api:1.0.0 .
```

Execução local com Docker:

```bash
docker run --rm \
  --name agrocontrol-api \
  -p 8080:8080 \
  -e ASPNETCORE_ENVIRONMENT="Development" \
  -e Jwt__Key="SUA_CHAVE_COM_PELO_MENOS_32_BYTES" \
  -e ConnectionStrings__DefaultConnection="SUA_CONNECTION_STRING" \
  -e Cors__AllowedOrigins__0="http://localhost:5173" \
  agrocontrol-api:1.0.0
```

## Testes e verificação

### Backend

```bash
dotnet build backend/ApiAgro/ApiAgro.csproj
dotnet test backend/ApiAgro.Tests/ApiAgro.Tests.csproj
```

### Frontend

```bash
cd frontend/FrontEndAgro
npm run lint
npm run build
```

## Observações

- preferências de perfil e parte das configurações ainda usam persistência local no navegador
- o repositório não armazena segredos, senhas ou chaves reais
- a documentação foi centralizada neste arquivo para reduzir duplicação
