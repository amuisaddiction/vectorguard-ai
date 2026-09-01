# VectorGuard AI

VectorGuard AI is an AI pipeline security scanner designed to detect and sanitize prompt injection, data exfiltration, jailbreak, and adversarial instructions before they reach a vector database.

## Architecture
- **Backend:** FastAPI, Python, SQLite, ChromaDB, OpenAI/Anthropic
- **Frontend:** React, Vite, Tailwind CSS, shadcn/ui

## Setup

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

