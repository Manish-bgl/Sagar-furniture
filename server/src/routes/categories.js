// server/src/routes/categories.js
// Category CRUD — All write operations require admin auth
import { Router } from 'express';
import { db } from '../config/firebase.js';
import { FieldValue } from 'firebase-admin/firestore';
import { verifyAuth, requireAdmin } from '../middleware/auth.js';

const router = Router();
const COLLECTION = 'categories';

// Default categories (same as frontend)
const DEFAULT_CATEGORIES = [
  { name: 'Living Room', emoji: '🛋️', order: 1 },
  { name: 'Bedroom', emoji: '🛏️', order: 2 },
  { name: 'Dining Room', emoji: '🍽️', order: 3 },
  { name: 'Office', emoji: '💼', order: 4 },
];

// Helper: generate slug from name
const toSlug = (name) => name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');

// -------------------------------------------------------
// ➕ POST /api/categories — Add category (admin only)
// -------------------------------------------------------
router.post('/', verifyAuth, requireAdmin, async (req, res) => {
  try {
    const { name, emoji = '📦', order = 99 } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Category name is required' });
    }

    const slug = toSlug(name);
    const docRef = await db.collection(COLLECTION).add({
      name,
      emoji,
      slug,
      order,
      createdAt: FieldValue.serverTimestamp(),
    });

    res.status(201).json({ id: docRef.id, slug, message: 'Category added successfully' });
  } catch (err) {
    console.error('Error adding category:', err);
    res.status(500).json({ error: 'Failed to add category: ' + err.message });
  }
});

// -------------------------------------------------------
// ✏️ PUT /api/categories/:id — Update category (admin only)
// -------------------------------------------------------
router.put('/:id', verifyAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, emoji } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Category name is required' });
    }

    const slug = toSlug(name);
    const docRef = db.collection(COLLECTION).doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Category not found' });
    }

    await docRef.update({
      name,
      emoji,
      slug,
      updatedAt: FieldValue.serverTimestamp(),
    });

    res.json({ id, slug, message: 'Category updated successfully' });
  } catch (err) {
    console.error('Error updating category:', err);
    res.status(500).json({ error: 'Failed to update category: ' + err.message });
  }
});

// -------------------------------------------------------
// 🗑️ DELETE /api/categories/:id — Delete category (admin only)
// -------------------------------------------------------
router.delete('/:id', verifyAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const docRef = db.collection(COLLECTION).doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Category not found' });
    }

    await docRef.delete();
    res.json({ id, message: 'Category deleted successfully' });
  } catch (err) {
    console.error('Error deleting category:', err);
    res.status(500).json({ error: 'Failed to delete category: ' + err.message });
  }
});

// -------------------------------------------------------
// 🌱 POST /api/categories/seed — Seed default categories (admin only)
// -------------------------------------------------------
router.post('/seed', verifyAuth, requireAdmin, async (req, res) => {
  try {
    const results = [];
    for (const cat of DEFAULT_CATEGORIES) {
      const slug = toSlug(cat.name);
      const docRef = await db.collection(COLLECTION).add({
        name: cat.name,
        emoji: cat.emoji,
        slug,
        order: cat.order,
        createdAt: FieldValue.serverTimestamp(),
      });
      results.push({ id: docRef.id, name: cat.name });
    }
    res.status(201).json({ message: 'Default categories added', categories: results });
  } catch (err) {
    console.error('Error seeding categories:', err);
    res.status(500).json({ error: 'Failed to seed categories: ' + err.message });
  }
});

export default router;
