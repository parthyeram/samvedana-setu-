// ─────────────────────────────────────────────────────────────
// SamvedanaSetu — Express Backend
//
// Responsibilities:
//   1. Serve the static frontend (index.html, styles, modules).
//   2. Proxy multimodal AI analysis requests to the Gemini API so the
//      GEMINI_API_KEY is NEVER exposed to the browser (spec §37).
//
// If GEMINI_API_KEY is not set, /api/analyze responds 503 and the
// frontend gracefully falls back to its local heuristic analyzer (§39).
// ─────────────────────────────────────────────────────────────

import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

// --- Minimal .env loader (avoids an extra dependency) ------------------
function loadEnv() {
    const envPath = path.join(ROOT, '.env');
    if (!fs.existsSync(envPath)) return;
    const lines = fs.readFileSync(envPath, 'utf8').split('\n');
    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const eq = trimmed.indexOf('=');
        if (eq === -1) continue;
        const key = trimmed.slice(0, eq).trim();
        const val = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, '');
        if (!(key in process.env)) process.env[key] = val;
    }
}
loadEnv();

const PORT = process.env.PORT || 3000;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-1.5-flash';

const app = express();
app.use(express.json({ limit: '12mb' })); // allow base64 image payloads

// --- Health / capability probe ----------------------------------------
app.get('/api/health', (_req, res) => {
    res.json({
        ok: true,
        aiConfigured: Boolean(GEMINI_API_KEY),
        model: GEMINI_MODEL,
        service: 'SamvedanaSetu Prototype API'
    });
});

// --- The structured prompt that drives the multimodal analysis ---------
function buildPrompt({ text, location, categories }) {
    const loc = location
        ? `District: ${location.district || '—'}, Block: ${location.block || '—'}, Village/Locality: ${location.village || '—'}.`
        : 'Location not provided.';

    return `You are the "AI Smart Problem Reporter" for SamvedanaSetu, a government + academia
civic-innovation platform. A citizen is reporting a societal problem using text and/or a photo.

Citizen text (may be empty): "${(text || '').replace(/"/g, "'")}"
Context: ${loc}

Analyse the evidence (text and image if present) and identify the societal challenge.

RULES:
- Choose "category" from EXACTLY this list: ${categories.join(' | ')}.
- Choose a reasonable "subcategory" that fits the category.
- If the citizen gave no title, GENERATE a clear, specific one. If their title is already
  clear, keep it. If it is vague (e.g. "bad road"), improve it.
- If the description is missing, generate a cautious draft grounded ONLY in the evidence.
  If it exists, you may improve clarity/grammar while preserving meaning.
- NEVER invent facts: no exact affected population, duration, measurements, government
  department, medical diagnosis, or agricultural disease diagnosis.
- For healthcare/agriculture use cautious wording ("possible", "preliminary observation").
- "detectedObjects" must reflect what is genuinely visible/implied, not guesses.
- "priorityScore" is 0-100 based on severity, urgency, safety risk, potential impact.
- "confidence" is 0-1.

Respond with STRICT JSON only (no markdown), with these keys:
{
  "problemDetected": boolean,
  "problem": string,
  "title": string,
  "description": string,
  "category": string,
  "subcategory": string,
  "severity": "Low" | "Medium" | "High" | "Critical",
  "severityReason": string,
  "priorityScore": number,
  "priorityLevel": "Low" | "Medium" | "High",
  "confidence": number,
  "summary": string,
  "detectedObjects": string[],
  "requiredExpertise": string[]
}`;
}

// --- Multimodal analysis proxy ----------------------------------------
app.post('/api/analyze', async (req, res) => {
    if (!GEMINI_API_KEY) {
        return res.status(503).json({
            error: 'AI service not configured on the server.',
            hint: 'Set GEMINI_API_KEY in .env to enable live multimodal analysis.'
        });
    }

    const { text = '', imageBase64 = '', mimeType = 'image/jpeg', location = null, categories = [] } = req.body || {};

    if (!text.trim() && !imageBase64) {
        return res.status(400).json({ error: 'Provide at least text or an image.' });
    }

    try {
        const parts = [{ text: buildPrompt({ text, location, categories }) }];
        if (imageBase64) {
            const clean = imageBase64.includes('base64,') ? imageBase64.split('base64,')[1] : imageBase64;
            parts.push({ inlineData: { mimeType, data: clean } });
        }

        const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;
        const geminiRes = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts }],
                generationConfig: { responseMimeType: 'application/json', temperature: 0.4 }
            })
        });

        if (!geminiRes.ok) {
            const detail = await geminiRes.text();
            console.error('Gemini API error:', geminiRes.status, detail);
            return res.status(502).json({ error: 'Upstream AI request failed.' });
        }

        const data = await geminiRes.json();
        const jsonText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
        let parsed;
        try {
            parsed = JSON.parse(jsonText);
        } catch {
            return res.status(502).json({ error: 'AI returned malformed data.' });
        }

        parsed.source = 'gemini';
        return res.json(parsed);
    } catch (err) {
        console.error('Analyze route error:', err);
        return res.status(500).json({ error: 'Internal analysis error.' });
    }
});

// --- Static frontend ---------------------------------------------------
app.use(express.static(ROOT));

// SPA fallback: send index.html for any non-API GET
app.get(/^(?!\/api).*/, (_req, res) => {
    res.sendFile(path.join(ROOT, 'index.html'));
});

app.listen(PORT, () => {
    console.log('');
    console.log('  SamvedanaSetu prototype running');
    console.log(`  →  http://localhost:${PORT}`);
    console.log(`  →  AI multimodal analysis: ${GEMINI_API_KEY ? 'ENABLED (Gemini)' : 'DISABLED — using local fallback'}`);
    console.log('');
});
