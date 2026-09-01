# VectorGuard AI — Tech Stack

**Version:** 1.0

---

## Backend (Member A owns this entirely)

| Category | Choice | Reason |
|---|---|---|
| Language | Python 3.11+ | AI/ML ecosystem, async support |
| Web Framework | FastAPI | Fast, async, auto-docs (Swagger UI) |
| LLM (Semantic Agent) | OpenAI GPT-4o-mini OR Anthropic Claude claude-haiku-4-5-20251001 | Cost-effective, fast inference |
| LLM SDK | `openai` Python SDK OR `anthropic` Python SDK | Official, well-documented |
| Embeddings | `text-embedding-ada-002` (OpenAI) OR `sentence-transformers/all-MiniLM-L6-v2` (local) | Fallback to local for offline demo |
| Vector DB | ChromaDB (local, no server needed) | Zero-config, perfect for hackathon |
| Relational DB | SQLite via `aiosqlite` | Zero-config alert storage |
| File Parsing | `pypdf2` (PDF), `python-multipart` (uploads) | Lightweight, no external deps |
| Testing | `pytest` + `pytest-asyncio` + `httpx` | FastAPI-native testing |
| Environment | `python-dotenv` | `.env` management |
| Containerization | Docker + docker-compose | Reproducible demo environment |

---

## Frontend (Member B owns this entirely)

| Category | Choice | Reason |
|---|---|---|
| Language | TypeScript | Type safety, matches backend contracts |
| Framework | React 18 + Vite | Fast dev server, modern React |
| Styling | Tailwind CSS v3 | Rapid UI, no custom CSS needed |
| Component Library | shadcn/ui | Accessible, Tailwind-native |
| Charts | Recharts | React-native, no D3 boilerplate |
| HTTP Client | Native fetch wrapped in `api.ts` | No extra deps needed |
| Icons | Lucide React | shadcn/ui standard |
| Routing | React Router v6 | SPA routing |
| State Management | React `useState` + `useContext` | MVP simplicity, no Redux overhead |
| Testing | Vitest + React Testing Library | Vite-native |
| Linting | ESLint + Prettier | Code quality |

---

## Shared / DevOps

| Category | Choice |
|---|---|
| Version Control | Git + GitHub (teammate manages main repo) |
| Branching Strategy | `main` (protected) · `dev/backend` · `dev/frontend` |
| CI | GitHub Actions — lint + test on PR to main |
| API Documentation | FastAPI auto-generates Swagger at `/docs` |
| Secrets | `.env` file (gitignored) + `.env.example` committed |
| Monorepo Structure | Single repo with `/backend` and `/frontend` directories |

---

## External APIs (Require Keys)

| Service | Usage | Who Sets Up |
|---|---|---|
| OpenAI API | GPT-4o-mini for semantic eval + ada-002 embeddings | Member A |
| OR Anthropic API | Claude claude-haiku-4-5-20251001 as LLM alternative | Member A |

> **Fallback plan:** If no API key available for demo, Member A must have `sentence-transformers` (local) and a local Ollama model (e.g., `mistral`) as zero-cost alternatives. Test both paths.

---

## Local Development Setup

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate       # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env           # Add your API keys
uvicorn api.main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev                    # Starts at http://localhost:5173
```

### Both (via Docker)
```bash
docker-compose up --build
# Backend: http://localhost:8000
# Frontend: http://localhost:5173
```

---

## Key `requirements.txt` (Backend)

```
fastapi==0.111.0
uvicorn[standard]==0.29.0
python-multipart==0.0.9
python-dotenv==1.0.1
openai==1.30.0
anthropic==0.28.0
chromadb==0.5.0
aiosqlite==0.20.0
pypdf2==3.0.1
sentence-transformers==2.7.0
pytest==8.2.0
pytest-asyncio==0.23.0
httpx==0.27.0
```

---

## Key `package.json` (Frontend)

```json
{
  "dependencies": {
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "react-router-dom": "^6.23.0",
    "recharts": "^2.12.0",
    "lucide-react": "^0.383.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.3.0"
  },
  "devDependencies": {
    "vite": "^5.2.0",
    "@vitejs/plugin-react": "^4.3.0",
    "typescript": "^5.4.0",
    "tailwindcss": "^3.4.0",
    "autoprefixer": "^10.4.0",
    "vitest": "^1.6.0",
    "@testing-library/react": "^15.0.0"
  }
}
```
