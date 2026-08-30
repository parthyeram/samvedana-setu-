import { GEMINI_API_KEY, GEMINI_MODEL, GROQ_API_KEY, HUGGING_FACE_API_KEY, HUGGING_FACE_MODEL } from '../config.js';

const parseJson = value => JSON.parse(String(value || '').replace(/^```json\s*/i, '').replace(/```$/i, '').trim());
const prompt = 'Return only JSON with title, category, subcategory, severity, severityReason, summary, requiredExpertise, detectedObjects. Analyze this civic problem using both the image and description. Choose the most specific category and subcategory, never a generic category when a specific visual issue is clear. Use these rules: visible garbage, landfill, trash, waste piles, dumping, or litter = category Sanitation and subcategory Waste Disposal; garbage trucks, missed pickup, or uncollected waste = Sanitation and Garbage Collection; potholes, broken asphalt, road cracks, or damaged roadway = Roads & Transportation and Potholes or Road Damage; water leakage, flooding, or contaminated water = Water Management. Do not classify garbage or potholes as Urban Infrastructure. Severity must be Low, Medium, or High. Healthcare observations are preliminary, not diagnoses.';
const normalizeCivicResult = result => { const signal = [result.title, result.summary, result.description, result.category, result.subcategory, ...(result.detectedObjects || [])].filter(Boolean).join(' ').toLowerCase(); if (/garbage|waste|dump|dumping|landfill|litter|trash|rubbish|refuse|debris|solid waste/.test(signal)) return { ...result, category: 'Sanitation', subcategory: /collection|pickup|uncollected/.test(signal) ? 'Garbage Collection' : 'Waste Disposal', requiredExpertise: ['Waste Management', 'Environmental Engineering'], detectedObjects: [...new Set([...(result.detectedObjects || []), 'garbage/waste dumping'])] }; if (result.category === 'Roads & Transportation' || /pothole|potholes|road damage|broken asphalt|damaged roadway|road crack/.test(signal)) return { ...result, category: 'Roads & Transportation', subcategory: /pothole|potholes/.test(signal) ? 'Potholes' : (result.subcategory === 'Road Damage' ? 'Road Damage' : 'Potholes'), requiredExpertise: ['Civil Engineering', 'Transportation Engineering'], detectedObjects: [...new Set([...(result.detectedObjects || []), 'road damage'])] }; return result; };
async function providerCall(url, body, headers, provider) { const controller = new AbortController(); const timeout = setTimeout(() => controller.abort(), 15000); try { const requestBody = typeof body === 'string' || body instanceof Uint8Array ? body : JSON.stringify(body); const response = await fetch(url, { method: 'POST', headers, body: requestBody, signal: controller.signal }); if (!response.ok) { const detail = (await response.text()).replace(/AIza[\w-]+/g, '[redacted]').slice(0, 240); throw new Error(`${provider} returned ${response.status}: ${detail}`); } return { response: await response.json(), provider }; } finally { clearTimeout(timeout); } }
async function analyzeWithGemini({ text, imageBase64, mimeType }) { const parts = [{ text: `${prompt}\nDescription: ${text || 'No description.'}` }]; if (imageBase64) parts.push({ inline_data: { mime_type: mimeType || 'image/jpeg', data: imageBase64 } }); const result = await providerCall(`https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`, { contents: [{ parts }], generationConfig: { responseMimeType: 'application/json' } }, { 'Content-Type': 'application/json' }, 'gemini'); return { result: parseJson(result.response.candidates?.[0]?.content?.parts?.[0]?.text), provider: result.provider }; }
async function analyzeWithGroq({ text, imageBase64, mimeType }) { const content = [{ type: 'text', text: `${prompt}\nDescription: ${text || 'No description.'}` }]; if (imageBase64) content.push({ type: 'image_url', image_url: { url: `data:${mimeType || 'image/jpeg'};base64,${imageBase64}` } }); const result = await providerCall('https://api.groq.com/openai/v1/chat/completions', { model: 'qwen/qwen3.6-27b', messages: [{ role: 'user', content: imageBase64 ? content : content[0].text }], response_format: { type: 'json_object' } }, { Authorization: `Bearer ${GROQ_API_KEY}`, 'Content-Type': 'application/json' }, 'groq'); return { result: parseJson(result.response.choices?.[0]?.message?.content), provider: result.provider }; }
async function analyzeWithHuggingFace({ imageBase64, mimeType }) { const result = await providerCall(`https://router.huggingface.co/hf-inference/models/${HUGGING_FACE_MODEL}`, Buffer.from(imageBase64, 'base64'), { Authorization: `Bearer ${HUGGING_FACE_API_KEY}`, 'Content-Type': mimeType || 'image/jpeg' }, 'hugging-face'); const caption = result.response?.[0]?.generated_text || 'Civic issue detected from image'; return { result: { title: caption, summary: caption, detectedObjects: [caption] }, provider: result.provider }; }

/**
 * Analyzes a challenge using AI
 * @param {Object} params
 * @param {string} params.text
 * @param {string} [params.imageBase64]
 * @param {string} [params.mimeType]
 */
export const analyzeChallenge = async ({ text, imageBase64, mimeType, inputType, location, latitude, longitude }) => {
  try {
    const isImage = inputType === 'image' || Boolean(imageBase64);
    let external = null;
    if (isImage) {
      const providers = [GEMINI_API_KEY && (() => analyzeWithGemini({ text, imageBase64, mimeType })), GROQ_API_KEY && (() => analyzeWithGroq({ text, imageBase64, mimeType })), HUGGING_FACE_API_KEY && (() => analyzeWithHuggingFace({ imageBase64, mimeType }))].filter(Boolean);
      for (const provider of providers) { try { external = await provider(); break; } catch (error) { console.warn('Image AI provider failed:', error.message); } }
    } else {
      const providers = [GEMINI_API_KEY && (() => analyzeWithGemini({ text })), GROQ_API_KEY && (() => analyzeWithGroq({ text, imageBase64: '', mimeType }))].filter(Boolean);
      for (const provider of providers) { try { external = await provider(); break; } catch (error) { console.warn('Text AI provider failed:', error.message); } }
    }
    if (external?.result) {
      const result = normalizeCivicResult(external.result);
      const resolvedLocation = String(location || '').trim() || (latitude != null && longitude != null ? `GPS coordinates ${Number(latitude).toFixed(6)}, ${Number(longitude).toFixed(6)}` : 'Location pending confirmation');
      const providerUsed = external.provider === 'gemini'
        ? `gemini (${GEMINI_MODEL})`
        : external.provider === 'groq'
          ? 'groq (qwen/qwen3.6-27b)'
          : external.provider === 'hugging-face'
            ? `hugging-face (${HUGGING_FACE_MODEL})`
            : external.provider;
      return { problemDetected: true, ...result, title: result.title || `${result.subcategory || result.category || 'Civic problem'} reported in ${resolvedLocation}`, summary: result.summary || `${result.subcategory || result.category || 'Civic problem'} reported at ${resolvedLocation}.`, location: resolvedLocation, providerUsed };
    }
    // Use deterministic demo analysis until a provider key is configured.
    const words = String(text || '').toLowerCase();
    let category = isImage ? 'Urban Infrastructure' : 'Public Administration';
    let subcategory = isImage ? 'Public Infrastructure' : 'Grievance Redressal/Corruption';
    let requiredExpertise = ['Civil Engineering', 'Urban Planning'];
    let detectedObjects = ['road damage'];
    if (/pothole|broken road|road damage|damaged road|road broken|street road/.test(words)) {
      category = 'Roads & Transportation';
      subcategory = /pothole/.test(words) ? 'Potholes' : isImage ? 'Road Damage' : (/traffic|transport|bus/.test(words) ? 'Traffic Problems' : 'Road Safety');
      requiredExpertise = ['Civil Engineering', 'Transportation Engineering'];
      detectedObjects = ['broken road'];
    } else if (/water|leak|pipeline|drinking|groundwater|irrigation/.test(words)) {
      category = 'Water Management';
      subcategory = /leak|pipeline/.test(words) ? 'Water Leakage' : /flood|waterlog/.test(words) ? 'Flooding / Waterlogging' : /groundwater|borewell|well/.test(words) ? 'Water Conservation' : 'Drinking Water';
      requiredExpertise = ['Water Management', 'Civil Engineering'];
      detectedObjects = ['water issue'];
    } else if (/garbage|waste|litter|dump/.test(words)) {
      category = /garbage|litter/.test(words) ? 'Sanitation' : 'Environment';
      subcategory = /garbage|litter/.test(words) ? 'Garbage Collection' : /plastic/.test(words) ? 'Plastic Waste' : 'Waste Management';
      requiredExpertise = ['Waste Management', 'Environmental Engineering'];
      detectedObjects = ['waste'];
    } else if (/school|teacher|student|classroom|education/.test(words)) {
      category = 'Education';
      subcategory = inputType === 'image' || imageBase64 ? 'School Infrastructure' : 'Teacher Support';
      requiredExpertise = ['Education Technology', 'Public Administration'];
      detectedObjects = ['education issue'];
    } else if (/crop|farmer|pest|agriculture|irrigation/.test(words)) {
      category = 'Agriculture';
      subcategory = /pest|disease|damage/.test(words) ? (isImage ? 'Crop Disease / Damage' : 'Crop Problems') : /irrigation/.test(words) ? 'Irrigation' : 'Farmer Support';
      requiredExpertise = ['Agricultural Engineering', 'Agronomy'];
      detectedObjects = ['agriculture issue'];
    }
    const severity = /danger|accident|injury|blocked|critical|large|deep|unsafe|urgent|days|week/.test(words) ? 'High' : /small|minor|slight/.test(words) ? 'Low' : 'Medium';
    const resolvedLocation = String(location || '').trim() || (latitude != null && longitude != null ? `GPS coordinates ${Number(latitude).toFixed(6)}, ${Number(longitude).toFixed(6)}` : 'Location pending confirmation');
    const response = {
      problemDetected: true,
      title: `${subcategory} reported in ${resolvedLocation}`,
      description: text || "Generated description based on image",
      category,
      subcategory,
      severity,
      severityReason: severity === 'High' ? 'Description indicates an urgent or potentially hazardous public issue.' : 'Severity estimated from the reported description.',
      priorityScore: severity === 'High' ? 85 : severity === 'Medium' ? 60 : 35,
      priorityLevel: severity,
      confidence: 0.92,
      summary: `${subcategory} reported at ${resolvedLocation}. Category: ${category}. Subcategory: ${subcategory}. Severity: ${severity}.`,
      location: resolvedLocation,
      detectedObjects,
      requiredExpertise,
      providerUsed: "prototype-demo"
    };

    return response;
  } catch (err) {
    console.error('AI Service Error:', err);
    return { error: true, message: 'AI analysis temporarily unavailable' };
  }
};
