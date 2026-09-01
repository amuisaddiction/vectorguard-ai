# 🛡️ VectorGuard AI — Member B: Frontend Engineer Master Prompt

**Your Role:** Frontend Engineer  
**Your Stack:** React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui, Recharts  
**Your Branch:** `dev/frontend` → open PRs to `main` (Member A reviews and merges)

---

## Your Mission

You build the face of VectorGuard AI — the dashboard that makes the security system visible, impressive, and demo-able in under 2 minutes. Your work is what judges interact with first. Member A (backend) will give you a running API URL by Day 3. Until then, you build entirely against mocked data that matches the exact same response shapes defined in `DESIGN_DOC.md`.

**The golden rule: never wait for the backend. Mock it, build the UI, integrate on Day 6.**

---

## Day 1 — Project Init

Member A will create the GitHub repo and add you as a collaborator. Once you receive the invite:

```bash
git clone https://github.com/<team>/vectorguard-ai.git
cd vectorguard-ai
git checkout dev/frontend
cd frontend
npm create vite@latest . -- --template react-ts
npm install
npm install -D tailwindcss autoprefixer postcss
npx tailwindcss init -p
npm install react-router-dom recharts lucide-react clsx tailwind-merge
```

Configure Tailwind in `tailwind.config.ts`:
```ts
content: ["./index.html", "./src/**/*.{ts,tsx}"]
```

Set the VectorGuard color theme in `src/index.css`:
```css
:root {
  --background: #0a0e1a;    /* Dark navy — security/trust */
  --surface: #111827;       /* Card background */
  --border: #1f2937;
  --accent: #3b82f6;        /* Blue — primary actions */
  --danger: #ef4444;        /* Red — threats */
  --success: #22c55e;       /* Green — clean/safe */
  --warning: #f59e0b;       /* Amber — suspicious */
  --text-primary: #f9fafb;
  --text-muted: #9ca3af;
}
```

Create `src/lib/types.ts` — copy the exact types from `DESIGN_DOC.md` Section 3. This is your contract with Member A.

Create `src/lib/api.ts`:
```typescript
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";
const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";

export async function scanFile(file: File): Promise<ScanResult> {
  if (USE_MOCK) return mockScanResult(file.name);
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(`${API_BASE}/api/scan`, { method: "POST", body: formData });
  if (!res.ok) throw new Error(`Scan failed: ${res.statusText}`);
  return res.json();
}

export async function getAlerts(limit = 50, offset = 0): Promise<Alert[]> { ... }
export async function getStats(): Promise<Stats> { ... }
export async function getHealth(): Promise<HealthStatus> { ... }
```

Create `src/lib/mock-data.ts` with realistic fake responses:
- `mockScanResult(filename)` — ScanResult with 2 fake threats
- `mockCleanResult(filename)` — ScanResult, status: "clean"
- `mockAlerts()` — array of 10 diverse alerts
- `mockStats()` — realistic stats numbers

Create `.env.local` (never commit this):
```
VITE_API_URL=http://localhost:8000
VITE_USE_MOCK=true
```

✅ **Day 1 Test:** `npm run dev` starts, blank page loads without console errors.

---

## PHASE 1: Foundation (Days 1–3)

**Day 2 — Core Reusable Components**

Build these first — they're used everywhere:

**`src/components/Navbar.tsx`**
- Logo: shield icon (Lucide `ShieldCheck`) + "VectorGuard AI" text
- Nav links: Upload, Alerts, Analytics
- Right side: small status dot — green if backend responds to `/api/health`, red if offline
- Check health on mount with a `useEffect`

**`src/components/ThreatBadge.tsx`**
- Props: `threatType: string, confidence: number`
- Color by type: ROLE_OVERRIDE → red, DATA_EXFIL → orange, JAILBREAK → red, PROMPT_INJECTION → yellow, ENCODING_TRICK → purple
- Shows `threat name · 87%` style label

**`src/components/MetricCard.tsx`**
- Props: `label, value, icon: LucideIcon, color?`
- Dark card with colored left border
- Used on the Analytics page for the top summary row

**`src/components/ScanResultPanel.tsx`**
- Status banner: green "✓ File is Clean" or red "⚠ Threats Detected & Neutralized"
- Summary row: X chunks scanned · Y threats blocked · Zms scan time
- Threat list: each threat as a card with `ThreatBadge`, snippet of the chunk text, agent that caught it, confidence progress bar
- Sanitized text preview: show the text with redacted spans highlighted in red background

✅ **Day 2 Test:** Render each component in `App.tsx` with hardcoded mock props. Verify visually in browser.

---

**Day 3 — Upload Page (Home)**

**`src/pages/Home.tsx`** — this is the hero screen judges see first.

**`src/components/UploadZone.tsx`**
- Drag-and-drop: handle `onDragOver`, `onDragLeave`, `onDrop`
- Click-to-browse: hidden `<input type="file" accept=".txt,.md,.pdf,.csv">`
- File validation: reject non-text files with a red inline error message
- File size limit: 5MB, show error if exceeded
- On file selected → call `scanFile()` from `api.ts` immediately

States:
1. `idle` — upload zone with dashed border, icon, instructions
2. `scanning` — progress animation, "Scanning with 3 AI agents..." message
3. `complete` — show `ScanResultPanel` below the zone
4. `error` — red error banner with retry button

Page layout:
```
[Navbar]

  ┌──────────────────────────────────────┐
  │   🛡️  Drop your file here to scan   │
  │   Supported: .txt  .md  .pdf  .csv  │
  │         [Browse Files]               │
  └──────────────────────────────────────┘

  [Scan progress bar — visible while scanning]

  [ScanResultPanel — appears after scan]

  ┌── How VectorGuard Works ────────────────┐
  │  1. File enters the pipeline            │
  │  2. Agent 1: Pattern matching           │
  │  3. Agent 2: Semantic AI evaluation     │
  │  4. Agent 3: Cross-chunk analysis       │
  │  5. Threats redacted → safe embedding   │
  └─────────────────────────────────────────┘
```

✅ **Day 3 Test:** Drag a file onto the zone → mock scan runs → results panel animates in. Click "Browse" → same result.

---

## PHASE 2: Additional Pages (Days 4–6)

**Day 4 — Alerts Page**

**`src/pages/Alerts.tsx`**

**`src/components/AlertsTable.tsx`**

Columns: Timestamp · File · Threat Type · Agent · Confidence · Action Taken

Features:
- Sort by any column (click header toggles asc/desc)
- Filter by threat type (dropdown)
- Filter by date range (two native `<input type="date">` fields)
- Confidence column: colored bar (red = high, yellow = medium, green = low)
- "Export CSV" button: generate and download CSV from current filtered rows using `Blob` API
- Pagination: 20 rows per page, prev/next buttons
- Empty state: friendly message if no alerts

✅ **Day 4 Test:** Populate with `mockAlerts()`. Verify sort, filter, export, and pagination all work.

---

**Day 5 — Analytics Page**

**`src/pages/Analytics.tsx`**

Top row — 4 metric cards using `MetricCard`:
- Total Files Scanned
- Threats Blocked
- Clean Files
- Avg Scan Time (ms)

**Chart 1 — Threats Over Time** (Recharts `LineChart`):
- X: last 7 days
- Y: threat count
- Use mock time-series data

**Chart 2 — Threat Type Breakdown** (Recharts `BarChart`):
- X: ROLE_OVERRIDE, DATA_EXFIL, JAILBREAK, PROMPT_INJECTION, ENCODING_TRICK
- Y: count
- Color each bar by category color (match `ThreatBadge` colors)

**Chart 3 — Agent Detection Contribution** (Recharts `BarChart`):
- Which of the 3 agents detected the most threats
- Pattern Scanner, Semantic Evaluator, Context Analyzer

✅ **Day 5 Test:** All charts render with mock data, no console errors, page is readable and not cluttered.

---

**Day 6 — Live API Integration + Error Handling**

Switch from mock to real backend. Update `.env.local`:
```
VITE_USE_MOCK=false
```

Test every page with Member A's running backend:
- Upload a clean file → verify "clean" result
- Upload a poisoned file → verify threats appear
- Alerts page → verify real alerts from DB load
- Analytics → verify real stats

Handle all error states:
- Backend offline → show banner "Backend unavailable — running in demo mode", fall back to mock data automatically
- Scan > 30 seconds → show "Scan taking longer than expected..."
- File parse error → "Could not read this file format, please try another"
- HTTP 500 → "Internal error — please try again"

Add loading skeletons (gray animated placeholder boxes) while data fetches.

✅ **Day 6 Test:** With backend running, full happy path works for both clean and poisoned files. Kill the backend → demo mode banner appears, mock data loads.

---

## PHASE 3: Polish (Days 7–8)

**Day 7 — UX Polish**

- Page transitions: CSS fade-in between routes (simple opacity + translateY animation)
- Results panel: animate in with a slide-up when scan completes
- Add a toast notification system (bottom-right corner, auto-dismisses after 4s):
  - Green: "File scanned successfully — no threats detected"
  - Red: "⚠️ Threats detected and neutralized"
- "Scan another file" button after results resets to idle state
- Keyboard shortcut: press `U` anywhere to focus the upload zone

**Day 8 — Demo Mode**

Add a "Run Demo" button in the Navbar (cyan/teal color to stand out).

When clicked:
- Fetch a pre-built poisoned sample embedded as a string in your code (or served as a static file)
- Run it through the scan pipeline automatically
- Show results just like a real upload
- This gives judges a one-click demonstration without needing to find a file

✅ **Day 8 Test:** Click "Run Demo" → full scan animation plays → threats appear in results panel.

---

## PHASE 4: Final Polish (Days 9–10)

**Day 9 — PR + Handoff to Member A**

Open a PR from `dev/frontend` → `main` on GitHub.

PR description should include:
- What pages are built
- Screenshot or short screen recording of the demo flow
- How to run: `npm install && npm run dev`
- Note which env vars are needed

**Day 10 — Final Demo Rehearsal**

Write your verbal demo script (bullet points):
1. "This is VectorGuard AI — a security firewall for AI vector pipelines"
2. "Here's a poisoned text file — look at the hidden injection command buried inside"
3. "Watch what happens when we upload it..." → drag file, watch scan animate
4. "VectorGuard caught [N] threats using 3 AI agents in [X]ms"
5. "The malicious content was redacted, clean text was safely embedded"
6. "Every detection is logged for audit" → Alerts page
7. "Here's our threat detection over time" → Analytics page

Rehearse with Member A. Target: under 2 minutes start to finish.

---

## Critical Rules for You

1. **Mock first, integrate last.** Never block your progress waiting for the backend. Build with mock data, switch on Day 6.
2. **`src/lib/types.ts` is sacred.** If Member A says a field name is changing, update types immediately and fix everywhere it's used.
3. **Demo Mode must always work.** Even if the backend is completely down during the demo, the judges should see a full scan run.
4. **Never commit `.env.local`.** Your API keys and local config stay local.
5. **Design for 1280px+ laptop screens.** Mobile responsiveness is optional — don't waste time on it.
6. **The upload page is your hero.** It's the first thing judges see — make it look polished and professional.

---

## Your Deliverables Checklist

- [ ] Vite + React + TypeScript + Tailwind project initialized and committed
- [ ] `api.ts` client with mock fallback working
- [ ] `types.ts` matching `DESIGN_DOC.md` contract exactly
- [ ] Upload page with drag-and-drop + scan flow
- [ ] `ScanResultPanel` showing threats, confidence, redacted text preview
- [ ] Alerts page with sort, filter, CSV export, pagination
- [ ] Analytics page with 3 Recharts charts
- [ ] Error states and offline fallback working
- [ ] Demo Mode button working
- [ ] Live API integration tested with backend
- [ ] PR opened on GitHub with screenshots
- [ ] Full demo rehearsed under 2 minutes
