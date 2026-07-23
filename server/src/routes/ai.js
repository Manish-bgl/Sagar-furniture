// server/src/routes/ai.js
// Gemini AI description generator — API key stays server-side only
import { Router } from 'express';
import https from 'https';
import { verifyAuth, requireAdmin } from '../middleware/auth.js';
import { aiRateLimiter } from '../middleware/rateLimiter.js';

const router = Router();

// -------------------------------------------------------
// 🤖 POST /api/ai/generate-description — Generate AI description (admin only + rate limited)
// -------------------------------------------------------
router.post('/generate-description', aiRateLimiter, verifyAuth, requireAdmin, async (req, res) => {
  try {
    const { name, category, material, dimensions, finish, warranty } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Product name is required' });
    }

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) {
      return res.status(500).json({ error: 'AI service not configured. Add GEMINI_API_KEY to server .env' });
    }

    // Build prompt
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

    // Call Gemini API using native HTTPS (no external dependency needed)
    const description = await callGeminiApi(GEMINI_API_KEY, prompt);
    res.json({ description });
  } catch (err) {
    console.error('AI generation error:', err.message);

    if (err.statusCode === 429) {
      return res.status(429).json({ error: 'Gemini API rate limit exceeded. Please wait 1 minute.' });
    }

    res.status(500).json({ error: 'AI generation failed: ' + err.message });
  }
});

/**
 * Call Gemini API using Node.js HTTPS module
 * Returns the generated text
 */
function callGeminiApi(apiKey, prompt) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.7, maxOutputTokens: 150 },
    });

    const options = {
      hostname: 'generativelanguage.googleapis.com',
      port: 443,
      path: `/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
      },
    };

    const apiReq = https.request(options, (apiRes) => {
      let responseBody = '';
      apiRes.on('data', (chunk) => { responseBody += chunk; });
      apiRes.on('end', () => {
        try {
          const data = JSON.parse(responseBody);

          if (apiRes.statusCode !== 200) {
            const error = new Error(data?.error?.message || 'AI generation failed');
            error.statusCode = apiRes.statusCode;
            reject(error);
            return;
          }

          const description = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
          if (!description) {
            reject(new Error('AI returned empty response'));
            return;
          }

          resolve(description);
        } catch (e) {
          reject(new Error('Failed to parse AI response'));
        }
      });
    });

    apiReq.on('error', (err) => {
      reject(new Error('Network error calling AI API: ' + err.message));
    });

    apiReq.write(postData);
    apiReq.end();
  });
}

export default router;
