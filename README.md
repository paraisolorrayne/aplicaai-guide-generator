# AplicaAI — Gerador de Guias

Plataforma para gerar guias práticos sobre IA de forma automatizada, com agente de gravação end-to-end.

## Funcionalidades

- **Geração de Conteúdo com IA**: Gera guias completos seguindo o formato AplicaAI usando OpenAI (ou template fallback)
- **Editor Visual Completo**: Interface admin com abas para informações, conteúdo e gravação
- **Agente de Gravação**: Sistema de automação com Playwright para gravar a execução dos guias
- **Página Pública**: Visualização dos guias com filtros por categoria, dificuldade e ferramenta
- **Formato Padronizado**: O que é, Por que usar, Passo a passo, Casos de uso, Dicas, Erros comuns, Conclusão

## Estrutura do Guia (Formato AplicaAI)

1. **O que é essa Solução?** — Explicação prática
2. **Por que usar [ferramenta]?** — 3 motivos principais
3. **Como Implementar: Passo a Passo** — Pré-requisitos + passos numerados
4. **Casos de Uso Práticos** — Comandos prontos para copiar
5. **Dicas Avançadas** — Extrair o máximo da ferramenta
6. **Erros Comuns para Evitar** — O que não fazer
7. **Conclusão** — Fechamento motivacional

## Setup

```bash
npm install
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

### Geração com IA (opcional)

Configure a variável de ambiente `OPENAI_API_KEY` para habilitar a geração de conteúdo com IA:

```bash
export OPENAI_API_KEY=sk-...
```

Sem a chave, o sistema gera conteúdo via template que pode ser editado manualmente.

### Gravação com Playwright (opcional)

Para usar a gravação automatizada, instale o Playwright:

```bash
npx playwright install chromium
```

## Rotas

| Rota | Descrição |
|------|-----------|
| `/` | Homepage |
| `/guias` | Listagem pública de guias |
| `/guias/[slug]` | Visualização completa do guia |
| `/admin` | Dashboard administrativo |
| `/admin/guias` | Gerenciamento de guias |
| `/admin/guias/novo` | Criar novo guia |
| `/admin/guias/[id]` | Editar guia |

## API

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/api/guias` | GET | Listar guias (filtros: category, difficulty, tool, search) |
| `/api/guias` | POST | Criar guia |
| `/api/guias/[id]` | GET/PUT/DELETE | CRUD individual |
| `/api/guias/generate` | POST | Gerar conteúdo com IA |
| `/api/guias/record` | POST | Iniciar gravação do guia |

## Tecnologias

- Next.js 16 (App Router)
- React 19
- CSS Modules
- OpenAI API (geração de conteúdo)
- Playwright (gravação automatizada)
