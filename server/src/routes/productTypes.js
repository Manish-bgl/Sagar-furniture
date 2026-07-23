// server/src/routes/productTypes.js
// Product Types (Item Types) CRUD — admin auth required
import { Router } from 'express';
import { db } from '../config/firebase.js';
import { FieldValue } from 'firebase-admin/firestore';
import { verifyAuth, requireAdmin } from '../middleware/auth.js';

const router = Router();
const COLLECTION = 'productTypes';

// Default item types (same as frontend)
const DEFAULT_PRODUCT_TYPES = [
  { key: 'bed', label: 'Bed', emoji: '🛏️', keywords: 'bed' },
  { key: 'sofa', label: 'Sofa', emoji: '🛋️', keywords: 'sofa, couch, settee' },
  { key: 'table', label: 'Table', emoji: '🍽️', keywords: 'table, dining table, coffee table, center table' },
  { key: 'chair', label: 'Chair', emoji: '💺', keywords: 'chair, armchair, recliner' },
  { key: 'wardrobe', label: 'Wardrobe', emoji: '🪟', keywords: 'wardrobe, cupboard, almirah, closet' },
  { key: 'cabinet', label: 'Cabinet', emoji: '🗄️', keywords: 'cabinet, tv unit, tv stand' },
  { key: 'shelf', label: 'Shelf', emoji: '📚', keywords: 'shelf, shelves, bookshelf, rack, bookcase' },
  { key: 'stool', label: 'Stool', emoji: '🪑', keywords: 'stool, bench, ottoman, pouf' },
  { key: 'dresser', label: 'Dresser', emoji: '🪞', keywords: 'dresser, dressing table, vanity, makeup table' },
  { key: 'swing', label: 'Swing', emoji: '🪂', keywords: 'swing, jhoola, hammock' },
];

// -------------------------------------------------------
// ➕ POST /api/product-types — Add item type (admin only)
// -------------------------------------------------------
router.post('/', verifyAuth, requireAdmin, async (req, res) => {
  try {
    const { label, emoji = '📦', keywords = '' } = req.body;

    if (!label) {
      return res.status(400).json({ error: 'Item type label is required' });
    }

    const key = label.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');

    const docRef = await db.collection(COLLECTION).add({
      key,
      label,
      emoji,
      keywords,
      createdAt: FieldValue.serverTimestamp(),
    });

    res.status(201).json({ id: docRef.id, key, message: 'Item type added successfully' });
  } catch (err) {
    console.error('Error adding product type:', err);
    res.status(500).json({ error: 'Failed to add item type: ' + err.message });
  }
});

// -------------------------------------------------------
// 🗑️ DELETE /api/product-types/:id — Delete item type (admin only)
// -------------------------------------------------------
router.delete('/:id', verifyAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const docRef = db.collection(COLLECTION).doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Item type not found' });
    }

    await docRef.delete();
    res.json({ id, message: 'Item type deleted successfully' });
  } catch (err) {
    console.error('Error deleting product type:', err);
    res.status(500).json({ error: 'Failed to delete item type: ' + err.message });
  }
});

// -------------------------------------------------------
// 🌱 POST /api/product-types/seed — Seed default item types (admin only)
// -------------------------------------------------------
router.post('/seed', verifyAuth, requireAdmin, async (req, res) => {
  try {
    const results = [];
    for (const item of DEFAULT_PRODUCT_TYPES) {
      const docRef = await db.collection(COLLECTION).add({
        key: item.key,
        label: item.label,
        emoji: item.emoji,
        keywords: item.keywords,
        createdAt: FieldValue.serverTimestamp(),
      });
      results.push({ id: docRef.id, label: item.label });
    }
    res.status(201).json({ message: 'Default item types added', types: results });
  } catch (err) {
    console.error('Error seeding product types:', err);
    res.status(500).json({ error: 'Failed to seed item types: ' + err.message });
  }
});

export default router;
