import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

// Always load the backend environment, even when started from the repository root.
const serverDir = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(serverDir, '../.env') });

export const PORT = process.env.PORT || 5000;
export const JWT_SECRET = process.env.JWT_SECRET || 'samvedanasetu-prototype-jwt-secret-2026';
export const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
export const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-3.7-flash';
export const GROK_API_KEY = process.env.GROK_API_KEY || '';
export const GROQ_API_KEY = process.env.GROQ_API_KEY || '';
export const HUGGING_FACE_API_KEY = process.env.HUGGING_FACE_API_KEY || '';
export const HUGGING_FACE_MODEL = process.env.HUGGING_FACE_MODEL || 'Salesforce/blip-image-captioning-base';
export const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';
export const MAX_AI_CALLS_PER_DAY = parseInt(process.env.MAX_AI_CALLS_PER_DAY || '20', 10);
export const DATABASE_URL = process.env.DATABASE_URL || 'file:./prisma/dev.db';
