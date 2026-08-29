# SamvedanaSetu — Citizen Societal Challenge Platform (Prototype)

**SamvedanaSetu** ("bridge of empathy") is a prototype **Citizen Dashboard + AI-powered
Societal Challenge Reporter**. Citizens report real-world problems (water, roads,
environment, healthcare, agriculture, and more) using **text, a photo, or both**. An AI
assistant detects the problem, drafts a clear title & description, classifies it, estimates
severity/priority, flags likely duplicates, and suggests the expertise needed to solve it —
then the **citizen reviews and edits everything before submitting**.

> ⚠️ **Prototype Demo — Sample Data.** All institutions/partners use generic labels
> (*Institution A*, *Industry Partner A*, *Government Department*, …). Nothing here is
> affiliated with any real university, company, or government body. Real organisations can
> be added later by an administrator **without changing the core code**.

Parts of the architecture (modular ES6 structure, auth/db mock-vs-backend pattern,
Gemini-vs-local-fallback AI pattern, Leaflet maps, Chart.js dashboards) are adapted from the
`community-hero-v2` project and rebuilt around a clean, light, government-green design system.

---

## ✨ Features

- **AI Smart Problem Reporter** — text-only / photo-only / text + photo (no video).
  AI generates or refines the title & description, categorises, sets severity + a 0–100
  priority score + confidence, detects objects in photos, and recommends required expertise.
- **Human-in-the-loop** — AI never auto-submits or auto-rejects. Every field is editable and
  the citizen's **original submission is always preserved** and labelled.
- **Responsible AI** — cautious wording for healthcare/agriculture ("possible", "preliminary
  observation"), never invents facts (population, measurements, departments, diagnoses).
- **Duplicate detection** — flags similar existing reports before submission.
- **Citizen dashboard** — quick stats, quick actions, donut chart (by category) and bar chart
  (by status), recent challenges.
- **My Challenges table** — Ch. No / Title / Category / District / Priority / Status /
  Submitted / Action, with search, category & status filters, and 10-per-page pagination.
- **Challenge detail** — overview, description (+ preserved original), evidence photo, AI
  analysis, **status timeline**, **SLA indicator**, and **top-3 institution matches**.
- **Notifications** bell, **profile**, **How It Works** (10 steps), **FAQ**, empty states.
- **Bilingual** English / Hindi (English default), **mobile responsive**, and a **PWA**.
- **Privacy by design** — a citizen only ever sees their own challenges
  (`challenge.submittedBy === currentUser.uid`).

---

## 🔐 AI API Key Security (important)

The Gemini API key is **never** placed in frontend code. A small **Node.js/Express** backend
(`server/server.js`) holds the key in an environment variable and proxies analysis requests to
Gemini. The browser calls `/api/analyze`; it never sees the key.

- Copy `.env.example` → `.env` and set `GEMINI_API_KEY`.
- **Never commit `.env` or your key.** `.gitignore` already excludes it.
- If no key is set, the app automatically uses a **local heuristic analyser** so the prototype
  still works end-to-end (with clearly reduced capability).

---

## 🚀 Getting started

### Option A — full experience (AI proxy + static hosting)

```bash
npm install
cp .env.example .env      # then edit .env and paste your GEMINI_API_KEY
npm start
```

Open **http://localhost:3000**.

> No key yet? `npm start` still works — the reporter uses the local fallback analyser.

### Option B — static only (local AI fallback, no backend)

```bash
npm run static
```

This serves the frontend without the Gemini proxy; AI analysis uses the local fallback.

### Demo login

| Role | Email | Password |
|------|-------|----------|
| Citizen | `citizen@demo.in` | `demo1234` |
| Admin*  | `admin@demo.in`   | `admin1234` |

\* The admin console is out of scope for this prototype; logging in as admin shows the citizen
dashboard with a note. You can also create a new citizen account from the login screen.

---

## 🧱 Project structure

```
samvedanasetu/
├── index.html              # SPA shell — all citizen views
├── styles.css              # Light government-green design system
├── app.js                  # Orchestrator: routing, auth, reporter, table, detail…
├── manifest.json  sw.js     # PWA manifest + offline service worker
├── .env.example            # Backend env template (copy to .env)
├── server/
│   └── server.js           # Express: static hosting + secure Gemini proxy
└── modules/
    ├── categories.js       # 12-category taxonomy (keywords, expertise, objects)
    ├── ai.js               # Backend call + local fallback + duplicate detection
    ├── db.js               # Data layer (localStorage mock, Firestore-ready) + seed
    ├── auth.js             # Citizen/admin auth (mock, Firebase-shaped)
    ├── institutions.js     # Expertise-based matching engine
    ├── challenges.js       # Status badges, timeline, SLA, formatting
    ├── map.js              # Leaflet location picker + detail map
    ├── dashboard.js        # Chart.js donut + bar
    └── i18n.js             # English / Hindi dictionary
```

---

## 🔧 Future-ready (going live)

The data layer (`modules/db.js`) and auth (`modules/auth.js`) expose stable function
signatures over a localStorage mock today. To go live, implement the **same signatures**
against Firestore / Firebase Auth — **no other module changes required**. Institutions and
partners are **data**, not hardcoded logic, so an admin can add real organisations later and
the matching engine picks them up automatically.

---

## 🎨 Design

Clean white background, thin borders, professional cards, subtle shadows, accessible
typography, and a Jharkhand-government-inspired green palette with clear status colours.
No glassmorphism, gradients, dark cards, neon, or heavy animation.

---

*SamvedanaSetu is an independent prototype for demonstration purposes only.*
