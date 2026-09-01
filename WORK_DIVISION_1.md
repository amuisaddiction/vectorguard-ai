# VectorGuard AI — Work Division

## One-Line Summary

> **Member A builds the brain (Python backend + AI agents) and manages the GitHub repo. Member B builds the face (React dashboard).**

---

## Division at a Glance

| What | Member A (Backend + GitHub) | Member B (Frontend) |
|---|---|---|
| Language | Python 3.11 | TypeScript / React |
| Framework | FastAPI | Vite + Tailwind + shadcn/ui |
| AI / Agents | ✅ All 3 detection agents | ❌ Not responsible |
| Vector DB | ✅ ChromaDB integration | ❌ Not responsible |
| REST API | ✅ Builds & owns all endpoints | Consumes via `api.ts` |
| Dashboard UI | ❌ Not responsible | ✅ All 3 pages |
| Charts / Analytics | ❌ Stats endpoint only | ✅ Recharts visualizations |
| Alert Logger | ✅ SQLite persistence | Reads via API |
| GitHub Repo | ✅ Owns repo, reviews PRs, merges | Works on `dev/frontend` |
| Docker | ✅ Backend Dockerfile + docker-compose | N/A |
| Demo Dataset | ✅ Creates poisoned + clean files | Uses files for demo |
| README | Backend section + overall structure | Provides frontend section |
| Tests | pytest (backend) | Vitest (frontend) |

---

## Integration Points (The 3 Moments to Sync)

### Sync 1 — End of Day 1
Member A → Member B:
- "Repo is up, you're added as collaborator, your branch is `dev/frontend`"
- Share the exact JSON shape of `/api/scan` response (even a stub)

Member B: updates `src/lib/mock-data.ts` to match that exact shape exactly.

### Sync 2 — End of Day 6
Member A: "All endpoints are live and working at `localhost:8000`"  
Member B: sets `VITE_USE_MOCK=false`, tests every page against the live backend, reports any field name mismatches

### Sync 3 — Day 10
Both: full end-to-end demo rehearsal together, fix any remaining issues, time the demo.

---

## Workload Estimate

| Phase | Days | Member A | Member B |
|---|---|---|---|
| Phase 1: Foundation | 1–3 | ~20 hrs (backend + repo setup) | ~15 hrs |
| Phase 2: Core Features | 4–6 | ~18 hrs | ~15 hrs |
| Phase 3: Integration | 7–8 | ~10 hrs | ~12 hrs |
| Phase 4: Polish + Demo | 9–10 | ~8 hrs | ~10 hrs |
| **Total** | | **~56 hrs** | **~52 hrs** |

Roughly equal. Member A's GitHub management adds ~3–4 hours spread across all days.

---

## The Golden Rule

> If you're blocked, don't wait — use mocks on the frontend, use stubs on the backend, and keep building. Integration happens on Day 6, not Day 1.
