# RigaudChat (chat-with-llm)

Assistente virtual de saúde que conversa com pacientes, registra o histórico por número de telefone e gera um sumário de triagem. O projeto é composto por:

- Backend (FastAPI + Gemini): API que conversa com o modelo Gemini e persiste conversas/sumários no MongoDB
- Frontend (Next.js + Tailwind): interface web de chat e busca de sumário

A identificação de cada conversa é feita pelo campo phone_number (string) — um telefone por paciente/cliente.

## Sumário
- Tecnologias
- Pré-requisitos
- Como rodar localmente
  - Backend (FastAPI)
  - Frontend (Next.js)
- Variáveis de ambiente (Backend)
- Fluxo e coleções no MongoDB
- Endpoints da API
- Dicas e solução de problemas

## Tecnologias
- Backend: Python 3.10+, FastAPI, Uvicorn, google-generativeai (Gemini), python-dotenv, PyMongo
- Frontend: Next.js 14, React 19, Tailwind CSS v4, Radix UI, react-markdown + remark-gfm
- Banco de dados: MongoDB

## Pré-requisitos
- Python 3.10 ou superior
- Node.js 18+ e npm
- Uma instância do MongoDB (local ou Atlas) e a URI de conexão
- Uma chave de API do Google AI Studio (Gemini)

## Como rodar localmente

### 1) Backend (FastAPI)

1. Crie o arquivo `.env` dentro da pasta `backend/` com as variáveis abaixo:

```
# backend/.env
GOOGLE_API_KEY=coloque_sua_chave_do_gemini_aqui
MONGODB_URI=mongodb://localhost:27017  # ou sua URI do Atlas
```

Observações:
- O modelo padrão configurado no código é `gemini-2.5-flash`. Para alterar, edite `backend/gemini_client.py`.
- O backend lê instruções do sistema a partir de `backend/prompt.json`.

2. Crie e ative um ambiente virtual e instale as dependências:

```
python -m venv .venv
source .venv/bin/activate
pip install -r backend/requirements.txt
```

3. Rode o servidor (porta 8000):

```
uvicorn backend.main:app --reload
```

Alternativa: `python backend/main.py`.

### 2) Frontend (Next.js)

1. Instale as dependências:

```
cd frontend
npm install
```

2. Suba o servidor de desenvolvimento (porta 3000):

```
npm run dev
```

3. Acesse: http://localhost:3000

Se rodar o frontend em outra origem/porta, ajuste o CORS no backend em `backend/main.py` (allow_origins).

## Variáveis de ambiente (Backend)
- `GOOGLE_API_KEY`: chave do Google AI Studio para o Gemini.
- `MONGODB_URI`: URI de conexão do MongoDB (ex.: `mongodb://localhost:27017` ou MongoDB Atlas).

## Fluxo e coleções no MongoDB
- Coleção `conversations` (DB: `chat`)
  - Documento chaveado por `_id = phone_number`
  - Campos: `created_at`, `turns` (lista de turnos `{ user, assistant, ts, meta }`)

- Coleção `summaries`
  - Documento chaveado por `_id = phone_number`
  - Campos: `triage_summary` (string ou objeto com `summary`), `finalized_at`

O backend salva automaticamente o sumário de triagem quando identifica palavras-chave na resposta do agente (heurística básica). Você pode adaptar a lógica em `backend/db_mongo.py`.

## Endpoints da API

Base URL: `http://127.0.0.1:8000`

- POST `/chat`
  - Body JSON:
    ```json
    { "message": "texto do usuário", "phone_number": "+5511999999999" }
    ```
  - Resposta:
    ```json
    { "reply": "resposta do agente", "phone_number": "+5511999999999" }
    ```

- GET `/conversations/{phone_number}`
  - Ex.: `/conversations/+5511999999999`
  - Retorna histórico e metadados da conversa.

- GET `/summary?phoneNumber={phone_number}`
  - Ex.: `/summary?phoneNumber=%2B5511999999999`
  - Retorna `{ _id, triage_summary, finalized_at }`.

## Frontend
- Chat (`/`):
  - Informe o número de telefone no cabeçalho e envie mensagens.
  - Respostas do agente são renderizadas com Markdown.
- Sumário (`/summary`):
  - Busque pelo número de telefone. O sumário é renderizado com Markdown.

## Dicas e solução de problemas
- CORS: se o frontend abrir em outra origem (host/porta), adicione-a em `allow_origins` no `backend/main.py`.
- 401/403 no Gemini: confirme `GOOGLE_API_KEY` no `.env` do backend.
- Conexão MongoDB: verifique `MONGODB_URI` e se o banco está acessível.
- Tailwind v4: o projeto usa `@tailwindcss/postcss`. Caso personalize, mantenha a configuração do PostCSS conforme `frontend/postcss.config.mjs`.