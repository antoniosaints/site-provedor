# MEGANET Site + Admin

Aplicação full stack para site institucional de provedor de internet com painel administrativo.

## Stack

- Node.js + Express + TypeScript
- Prisma + SQLite inicial
- React + Vite + TypeScript
- Tailwind CSS
- TanStack Query
- React Hook Form
- TipTap para editor rico do blog
- JWT em cookie `httpOnly`

## Requisitos

- Node.js 22+
- npm 10+

## Configuração

1. Instale as dependências:

```bash
npm install
```

2. Crie o `.env` da API:

```bash
copy .env.example apps\api\.env
```

3. Rode migration e seed:

```bash
npm run db:migrate
npm run db:seed
```

4. Inicie API e frontend:

```bash
npm run dev
```

## URLs

- Site público: http://localhost:5173
- Admin: http://localhost:5173/admin
- API: http://localhost:3333

## Login inicial

- E-mail: `admin@meganet.com.br`
- Senha: `admin123`

Altere esses valores no `.env` antes de rodar o seed em um ambiente real.

## Estrutura

```text
apps/
  api/
    prisma/
    src/
    uploads/
  web/
    public/
    src/
```

## Módulos incluídos

- Banners
- Planos
- Blog e categorias
- Depoimentos
- Mensagens de contato
- Solicitações de cobertura
- Configurações gerais
- Dados institucionais
- Missão, visão e valores
- Redes sociais
- Upload local de imagens

## Observações de produção

- Troque `JWT_SECRET`.
- Configure `WEB_ORIGIN` na API com o domínio real do frontend. Se usar com e sem `www`, informe ambos separados por vírgula: `https://meganetma.com.br,https://www.meganetma.com.br`.
- Configure `VITE_API_URL` no frontend antes de rodar `npm run build -w apps/web`. O proxy do Vite só existe em desenvolvimento e não é aplicado no build hospedado.
- Se frontend e API ficarem em domínios diferentes, use `AUTH_COOKIE_SAME_SITE=none` e `AUTH_COOKIE_SECURE=true` na API. O cookie de admin precisa dessas opções para ser enviado em requisições `fetch` com `credentials: 'include'`.
- Se o deploy servir `/api` e `/uploads` pelo mesmo domínio do frontend via proxy/rewrite, `VITE_API_URL` pode ficar vazio e o cookie pode usar `AUTH_COOKIE_SAME_SITE=lax`.
- Configure o servidor do frontend para reescrever rotas SPA para `index.html`; sem isso, acessar `/admin` diretamente pode parar no servidor antes de o React redirecionar para `/admin/login`.
- Migre SQLite para PostgreSQL alterando o `provider` e `DATABASE_URL` no Prisma.
- Use storage externo para uploads se o deploy for serverless ou com múltiplas instâncias.
