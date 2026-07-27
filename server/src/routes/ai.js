// server/src/routes/ai.js
// Groq AI description generator — API key stays server-side only
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

    const GROQ_API_KEY = process.env.GROQ_API_KEY;
    if (!GROQ_API_KEY) {
      return res.status(500).json({ error: 'AI service not configured. Add GROQ_API_KEY to server .env' });
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

    const prompt = `You are a product description writer for "Sagar Furniture", an Indian furniture store.
Write a short and simple product description in plain English for the following furniture item.

${productDetails}

Requirements:
- MAXIMUM 2 sentences, max 40 words total
- Use simple, everyday language that anyone can understand
- Mention the material and key feature naturally
- No fancy or complex words
- Do NOT use phrases like "high quality", "premium", "craftsmanship", "elevate"
- Return ONLY the description text, nothing else`;

    // Call Groq API using native HTTPS (no external dependency needed)
    const description = await callGroqApi(GROQ_API_KEY, prompt);
    res.json({ description });
  } catch (err) {
    console.error('AI generation error:', err.message);

    if (err.statusCode === 429) {
      return res.status(429).json({ error: 'Groq API rate limit exceeded. Please wait 1 minute.' });
    }

    res.status(500).json({ error: 'AI generation failed: ' + err.message });
  }
});

/**
 * Call Groq API using Node.js HTTPS module
 * Returns the generated text
 */
function callGroqApi(apiKey, prompt) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 150,
    });

    const options = {
      hostname: 'api.groq.com',
      port: 443,
      path: '/openai/v1/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
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

          const description = data?.choices?.[0]?.message?.content?.trim();
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
