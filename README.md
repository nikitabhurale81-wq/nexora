# NEXORA AI — Full Stack Workspace

Full-stack AI productivity platform with RAG document chat, code generation, dataset analysis, voice transcription, reports, and admin dashboard.

## Project Structure

```
nexora/
├── backend/     # FastAPI + PostgreSQL + Supabase Auth
└── frontend/    # Next.js 14 + TypeScript + Tailwind CSS
```

## Backend Stack
- **FastAPI** — REST API (45 endpoints)
- **PostgreSQL** — via Supabase
- **Supabase Auth** — JWT authentication
- **AI Providers** — HuggingFace, Gemini, OpenAI
- **RAG** — Document chunking + vector embeddings

## Frontend Stack
- **Next.js 14** — App Router
- **TypeScript** — Type safety
- **Tailwind CSS** — Styling
- **Supabase** — Auth client

## Setup

### Backend
```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env   # Fill in your values
alembic upgrade head
uvicorn app.main:app --reload
```

### Frontend
```bash
cd frontend
npm install
cp .env.example .env.local   # Fill in your values
npm run dev
```

## Environment Variables

See `backend/.env.example` and `frontend/.env.example` for required variables.
