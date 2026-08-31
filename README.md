# Samvedana Setu

> **AI Civic Bridge** | Transforming community problems into verified, collaborative, and measurable solutions.

Samvedana Setu is a civic-tech platform that connects citizens, government officials, universities, and industry partners through one intelligent problem-to-solution pipeline. A citizen report becomes structured data, a verified public challenge, a matched innovation project, and a trackable community outcome.

## Why Samvedana Setu?

| Without a connected system | With Samvedana Setu |
|---|---|
| Scattered complaints | One structured challenge register |
| Repeated reports | Automatic duplicate detection |
| Unclear ownership | Government verification and routing |
| Unused academic expertise | Institute matching and student teams |
| Fragmented industry support | Collaboration, mentoring, and deployment |
| No visibility after submission | Public progress and solution tracking |

## Product Snapshot

```text
Input:     Text + image + GPS + documents
Intelligence: Classification + severity + expertise + duplicate detection
Action:    Verification + matching + collaboration + project execution
Outcome:   Tested solution + evidence + government review + public impact
```

## Workflow

```text
Citizen report -> AI classification -> Duplicate check -> Government verification
-> Institute and industry matching -> Collaboration -> Milestones and evidence
-> Shared solution submission -> Government review -> Citizen tracking
```

Duplicate active reports with the same category, subcategory, and location are automatically rejected with `Similar problem already registered.`

## Features

- Citizen signup, login, reporting, and personal challenge tracking.
- Text, image, GPS, map-click, and worldwide location search.
- AI category, subcategory, severity, summary, detected-object, and expertise suggestions.
- Provider visibility: Gemini, Groq, Hugging Face, or `prototype-demo` fallback.
- Government verification queue and status transitions.
- Institute matching and project team management.
- Industry collaboration requests for mentorship, funding, equipment, testing, and deployment.
- Milestones, deliverables, approvals, testing records, outcomes, IP records, and project logs.
- One shared solution submission for accepted collaboration projects.
- Notifications, analytics, live map, and citizen-visible progress timeline.

## System Architecture

```text
Presentation: React.js + Vite + React Router + Axios + responsive CSS
       |
       | HTTPS REST API
       v
Application: Node.js + Express.js + JWT + RBAC + bcryptjs + rate limiting
       |
       | Prisma ORM
       v
Data: PostgreSQL in production / SQLite for local development
```

Supporting services:

```text
Backend -> Gemini / Groq / Hugging Face
Frontend -> Cloudinary image storage
Frontend/backend -> Firebase optional Firestore mirror
Frontend -> Vercel
Backend -> Render
Database -> Render PostgreSQL
```

## Project Structure

```text
samvedanasetu/
|-- client/              React and Vite frontend
|   |-- src/api/          Axios API client
|   |-- src/components/   Shared UI and map picker
|   |-- src/pages/        Role-specific pages
|   `-- src/services/     Firebase and Cloudinary integrations
|-- server/               Express and Prisma backend
|   |-- prisma/           Schema and seed scripts
|   `-- src/              Routes, services, middleware, and server entry
|-- .env.example          Backend environment template
`-- README.md
```

## Local Setup

Install dependencies:

```powershell
npm install
cd client; npm install
cd ..\server; npm install
```

Create `server/.env`:

```env
PORT=5000
NODE_ENV=development
JWT_SECRET=use-a-long-random-secret
DATABASE_URL=file:./prisma/dev.db
GEMINI_API_KEY=your_gemini_key
GEMINI_MODEL=gemini-3.6-flash
GROQ_API_KEY=your_groq_key
HUGGING_FACE_API_KEY=your_huggingface_token
HUGGING_FACE_MODEL=Salesforce/blip-image-captioning-base
MAX_AI_CALLS_PER_DAY=20
```

Prepare the database:

```powershell
cd server
npx prisma generate
npx prisma db push
```

For a new demonstration database only:

```powershell
npm run db:seed
```

Warning: the seed script clears existing tables before inserting demo data. Do not run it on real data.

Start the backend in one terminal:

```powershell
cd server
npm run dev
```

Start the frontend in another:

```powershell
cd client
npm run dev
```

Open `http://localhost:3000`. Vite proxies `/api` and `/uploads` to port `5000`.

## Demo Accounts

The seed creates demonstration accounts:

```text
Citizen:    citizen@demo.in       / demo1234
Government: admin@demo.in         / admin1234
Government: govt@demo.in          / demo1234
Institute:  institution@demo.in   / demo1234
Industry:   industry@demo.in      / demo1234
```

Change passwords before real use.

## AI Providers

The backend tries providers in this order:

1. Gemini using `GEMINI_MODEL`.
2. Groq using `qwen/qwen3.6-27b`.
3. Hugging Face image captioning using `HUGGING_FACE_MODEL`.
4. Deterministic `prototype-demo` fallback.

The browser never receives API keys. It displays only a safe provider/model label such as `gemini (gemini-3.6-flash)`. Provider requests have timeouts and failures are logged without secrets.

## Cloudinary and Firebase

For image uploads, configure the frontend:

```env
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_unsigned_upload_preset
```

Firebase is optional:

```env
VITE_FIREBASE_API_KEY=your_web_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_APP_ID=your_app_id
```

## Production Deployment

### Render backend

Create a Render PostgreSQL database and use its internal URL for the backend service. Configure:

```text
Build: npm install && npx prisma generate && npx prisma db push
Start: npm start
```

Backend environment variables belong in Render:

```env
DATABASE_URL=render_internal_postgresql_url
JWT_SECRET=long_random_production_secret
GEMINI_API_KEY=server_only_key
GEMINI_MODEL=gemini-3.6-flash
GROQ_API_KEY=server_only_key
HUGGING_FACE_API_KEY=server_only_token
HUGGING_FACE_MODEL=Salesforce/blip-image-captioning-base
NODE_ENV=production
```

Never put backend secrets in Vercel or GitHub.

### Vercel frontend

Use:

```text
Root Directory: client
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

Add frontend variables:

```env
VITE_API_URL=https://samvedana-setu-backend.onrender.com/api
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_unsigned_upload_preset
```

Add Firebase variables only when Firebase is enabled. Redeploy Vercel after changing environment variables.

## Security

- Never commit `.env`, `server/.env`, or API keys.
- Rotate keys exposed in screenshots, logs, or Git history.
- Keep Gemini, Groq, Hugging Face, JWT, and database values on Render.
- Restrict Firebase keys to approved domains.
- Use HTTPS, JWT, RBAC, bcrypt, rate limiting, file validation, CORS, and audit logs.
- Treat AI output as a recommendation; government verification remains human-controlled.

## Testing Checklist

- Test every role's login and permissions.
- Test text and image AI analysis and provider labels.
- Test AI failure and deterministic fallback.
- Test duplicate rejection and the explanation message.
- Test GPS, map-click, and location search.
- Test government verification and status transitions.
- Test institute matching, team management, and industry collaboration.
- Test shared solution submission locking.
- Test evidence visibility and citizen tracking.
- Test Vercel-to-Render API communication after deployment.

## Future Scope

Planned improvements include multilingual and voice reporting, video analysis, native mobile support, secure stakeholder chat, predictive maintenance, district heat maps, response-time analytics, impact measurement, stronger file moderation, automated tests, monitoring, government identity integration, and multi-state deployment.

## References

- Government of Jharkhand, Department of Higher and Technical Education, Problem Statement ID 26043.
- National Education Policy 2020, Ministry of Education, Government of India.
- React, Vite, Express, Prisma, PostgreSQL, Gemini, Groq, Hugging Face, Cloudinary, Firebase, Render, and Vercel documentation.

## Disclaimer

Samvedana Setu is an independent civic innovation prototype. Seed organizations and accounts are fictional demonstration data and are not affiliated with real institutions or government bodies.
