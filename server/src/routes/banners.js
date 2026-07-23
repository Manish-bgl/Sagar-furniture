// server/src/routes/banners.js
// Banner CRUD — All write operations require admin auth
import { Router } from 'express';
import { db } from '../config/firebase.js';
import { FieldValue } from 'firebase-admin/firestore';
import { verifyAuth, requireAdmin } from '../middleware/auth.js';

const router = Router();
const COLLECTION = 'banners';

// -------------------------------------------------------
// ➕ POST /api/banners — Add banner (admin only)
// -------------------------------------------------------
router.post('/', verifyAuth, requireAdmin, async (req, res) => {
  try {
    const { title, subtitle, linkUrl, imageUrl, imagePublicId, order = 1 } = req.body;

    const docRef = await db.collection(COLLECTION).add({
      title: title || '',
      subtitle: subtitle || '',
      linkUrl: linkUrl || '',
      imageUrl: imageUrl || '',
      imagePublicId: imagePublicId || '',
      active: true,
      order: order || 1,
      createdAt: FieldValue.serverTimestamp(),
    });

    res.status(201).json({ id: docRef.id, message: 'Banner added successfully' });
  } catch (err) {
    console.error('Error adding banner:', err);
    res.status(500).json({ error: 'Failed to add banner: ' + err.message });
  }
});

// -------------------------------------------------------
// ✏️ PUT /api/banners/:id — Update banner (admin only)
// -------------------------------------------------------
router.put('/:id', verifyAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, subtitle, linkUrl, imageUrl, imagePublicId, order } = req.body;

    const docRef = db.collection(COLLECTION).doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Banner not found' });
    }

    await docRef.update({
      title: title || '',
      subtitle: subtitle || '',
      linkUrl: linkUrl || '',
      imageUrl: imageUrl || doc.data().imageUrl || '',
      imagePublicId: imagePublicId || doc.data().imagePublicId || '',
      order: order || 1,
      updatedAt: FieldValue.serverTimestamp(),
    });

    res.json({ id, message: 'Banner updated successfully' });
  } catch (err) {
    console.error('Error updating banner:', err);
    res.status(500).json({ error: 'Failed to update banner: ' + err.message });
  }
});

// -------------------------------------------------------
// 🗑️ DELETE /api/banners/:id — Delete banner (admin only)
// -------------------------------------------------------
router.delete('/:id', verifyAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const docRef = db.collection(COLLECTION).doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Banner not found' });
    }

    await docRef.delete();
    res.json({ id, message: 'Banner deleted successfully' });
  } catch (err) {
    console.error('Error deleting banner:', err);
    res.status(500).json({ error: 'Failed to delete banner: ' + err.message });
  }
});

// -------------------------------------------------------
// 🔄 PATCH /api/banners/:id/toggle — Toggle active/inactive (admin only)
// -------------------------------------------------------
router.patch('/:id/toggle', verifyAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const docRef = db.collection(COLLECTION).doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Banner not found' });
    }

    const currentActive = doc.data().active;
    await docRef.update({ active: !currentActive });

    res.json({ id, active: !currentActive, message: currentActive ? 'Banner deactivated' : 'Banner activated' });
  } catch (err) {
    console.error('Error toggling banner:', err);
    res.status(500).json({ error: 'Failed to toggle banner: ' + err.message });
  }
});

export default router;
