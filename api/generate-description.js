// api/generate-description.js
// Vercel Serverless Function — API key is SERVER-SIDE only, never exposed to browser
// Endpoint: POST /api/generate-description

export default async function handler(req, res) {
  // ─── CORS Headers (allow only your domain in production) ───
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // ─── Validate input ───
  const { name, category, material, dimensions, finish, warranty } = req.body || {};

  if (!name) {
    return res.status(400).json({ error: 'Product name is required' });
  }

  // ─── API Key from server environment (SAFE — not visible to browser) ───
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  if (!GEMINI_API_KEY) {
    return res.status(500).json({ error: 'AI service not configured' });
  }

  // ─── Build prompt ───
  const productDetails = [
    `Product Name: ${name}`,
    category ? `Category: ${category}` : null,
    material ? `Material: ${material}` : null,
    dimensions ? `Dimensions: ${dimensions}` : null,
    finish ? `Polish/Finish: ${finish}` : null,
    warranty ? `Warranty: ${warranty}` : null,
  ].filter(Boolean).join('\n');

  const prompt = `You are an expert furniture copywriter for an Indian furniture store called "Sagar Furniture". 
Write a compelling, professional product description in English for the following furniture item.

${productDetails}

Requirements:
- 2-3 sentences, max 80 words
- Highlight craftsmanship, quality, and durability
- Use warm, inviting language suitable for Indian families
- Mention the material and finish naturally
- Do NOT use generic phrases like "high quality" or "best product"
- End with a subtle note about longevity or family use
- Return ONLY the description text, no labels or quotes`;

  try {
    // ─── Call Gemini API ───
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 150,
          },
        }),
      }
    );

    if (!response.ok) {
      const errData = await response.json();
      console.error('Gemini API error:', errData);
      const apiMessage = errData?.error?.message || 'AI generation failed';
      return res.status(502).json({ error: `Gemini API: ${apiMessage}` });
    }

    const data = await response.json();
    const description = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!description) {
      return res.status(502).json({ error: 'AI returned empty response. Please try again.' });
    }

    return res.status(200).json({ description });

  } catch (err) {
    console.error('Server error:', err);
    return res.status(500).json({ error: 'Server error. Please try again.' });
  }
}
