# NEXORA AI — Backend

Production-oriented FastAPI backend for the NEXORA AI productivity workspace.
It powers AI chat, document (PDF/DOCX) RAG, Excel/CSV analysis, a coding
assistant, user-controlled AI memory, voice, report generation, usage &
subscriptions, and an admin dashboard.

This service is **separate from the frontend**. It lives beside the `NEXORA/`
project folder:

```
AI Assistance RAG/
├── NEXORA/
│   └── frontend/         # Next.js app (not modified by the backend)
└── nexora-backend/       # this FastAPI service
```

---

## Tech stack

| Area | Choice |
|------|--------|
| Language / framework | Python 3.12, FastAPI, Uvicorn |
| Config | Pydantic + Pydantic Settings |
| Database | Supabase PostgreSQL, SQLAlchemy 2.x (async), Alembic, pgvector |
| Auth | Supabase Auth (JWT verified via JWKS) — no passwords stored here |
| AI | Provider-agnostic (Gemini / OpenAI), switchable via env |
| Storage | Cloudflare R2 (S3-compatible) |
| Cache | Redis / Upstash (optional, lazy) |
| Reports | ReportLab, python-docx, OpenPyXL |
| Tests | Pytest, HTTPX (external APIs mocked) |

---

## Project structure

```
nexora-backend/
├── app/
│   ├── main.py            # FastAPI app factory, CORS, lifespan
│   ├── api/
│   │   ├── router.py      # aggregates versioned routers
│   │   └── v1/            # versioned endpoints (health, + features by phase)
│   ├── core/              # config, logging, exceptions, responses
│   ├── database/          # async engine/session, declarative base
│   ├── models/            # ORM models (added in Phase 3)
│   ├── schemas/           # Pydantic request/response models
│   ├── services/          # business logic (ai, chat, rag, ...)
│   ├── integrations/      # supabase, cloudflare_r2, redis, ai_providers
│   └── utils/
├── migrations/            # Alembic (env.py ready; migrations from Phase 3)
├── tests/                 # offline tests (no real credentials needed)
├── requirements.txt
├── .env.example
├── alembic.ini
├── Dockerfile
└── README.md
```

---

## Local setup (Windows / PowerShell)

```powershell
cd nexora-backend

# 1) Create the Python 3.12 virtual environment
py -3.12 -m venv .venv

# 2) Activate it
.\.venv\Scripts\Activate.ps1

# 3) Install dependencies
pip install -r requirements.txt

# 4) Create your local env file
Copy-Item .env.example .env   # then fill values as services are configured

# 5) Run the API (reload for development)
uvicorn app.main:app --reload --port 8000
```

Open:
- Health: http://localhost:8000/api/v1/health
- Readiness: http://localhost:8000/api/v1/health/ready
- Swagger docs: http://localhost:8000/docs

> The app starts **without** a database or any external credentials.
> DB-backed and integration endpoints return a clear "not configured"
> response until their env values are set.

---

## Tests

```powershell
.\.venv\Scripts\Activate.ps1
pytest -q
```

Tests are fully offline — they never call real AI, Supabase, or storage APIs.

---

## Environment variables

See [`.env.example`](./.env.example) for the full, documented list. Every
value has a safe local default; production requires the real values and is
validated at startup (`APP_ENV=production`).

---

## Frontend integration

- Set the frontend env `NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1`
  and `NEXT_PUBLIC_USE_MOCK=false` to point the existing Next.js app at this
  backend. (Frontend config only — no frontend source files are modified.)
- The frontend sends `Authorization: Bearer <supabase_access_token>`; the
  backend verifies it against the Supabase JWKS.
- Responses use a consistent envelope: `{ "success", "data", "message" }`
  for success and `{ "success": false, "error": { "code", "message" } }`
  for errors.

---

## Build phases

- **Phase 2 (done):** foundation — app, config, DB session, health, errors,
  logging, CORS, Dockerfile, offline tests.
- **Phase 3+:** auth + models + migrations, chat, RAG, data analysis, coding,
  memory, voice, reports, subscriptions, admin, deployment.

Detailed docs live in `../NEXORA-docs` references and will be expanded per
phase (API endpoints, DB schema, deployment, security).
