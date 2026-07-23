// server/src/routes/visits.js
// Visitor tracking — public endpoint (no auth required)
import { Router } from 'express';
import { db } from '../config/firebase.js';
import { FieldValue } from 'firebase-admin/firestore';

const router = Router();
const COLLECTION = 'visits';

// -------------------------------------------------------
// 📈 POST /api/visits — Track website visitor (public)
// -------------------------------------------------------
router.post('/', async (req, res) => {
  try {
    const { visitorId } = req.body;

    if (!visitorId) {
      return res.status(400).json({ error: 'Visitor ID is required' });
    }

    await db.collection(COLLECTION).add({
      visitorId,
      userAgent: req.headers['user-agent'] || '',
      ip: req.ip || req.headers['x-forwarded-for'] || '',
      timestamp: FieldValue.serverTimestamp(),
    });

    res.json({ message: 'Visit tracked' });
  } catch (err) {
    console.error('Error tracking visit:', err);
    // Don't fail silently for visitor — just return success
    res.json({ message: 'Visit tracked' });
  }
});

export default router;
