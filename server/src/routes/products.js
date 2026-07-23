// server/src/routes/products.js
// Product CRUD — All write operations require admin auth
import { Router } from 'express';
import { db } from '../config/firebase.js';
import { FieldValue } from 'firebase-admin/firestore';
import { verifyAuth, requireAdmin } from '../middleware/auth.js';

const router = Router();
const COLLECTION = 'products';

// -------------------------------------------------------
// ➕ POST /api/products — Add new product (admin only)
// -------------------------------------------------------
router.post('/', verifyAuth, requireAdmin, async (req, res) => {
  try {
    const { name, category, productType, price, material, dimensions, finish, warranty, description, imageUrls = [], imagePublicIds = [] } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Product name is required' });
    }

    const docRef = await db.collection(COLLECTION).add({
      name,
      category: category || 'living',
      productType: productType || '',
      price: price || '',
      material: material || '',
      dimensions: dimensions || '',
      finish: finish || '',
      warranty: warranty || '',
      description: description || '',
      imageUrl: imageUrls[0] || '',
      imagePublicId: imagePublicIds[0] || '',
      imageUrls,
      imagePublicIds,
      featured: false,
      viewCount: 0,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    res.status(201).json({ id: docRef.id, message: 'Product added successfully' });
  } catch (err) {
    console.error('Error adding product:', err);
    res.status(500).json({ error: 'Failed to add product: ' + err.message });
  }
});

// -------------------------------------------------------
// ✏️ PUT /api/products/:id — Update product (admin only)
// -------------------------------------------------------
router.put('/:id', verifyAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, productType, price, material, dimensions, finish, warranty, description, imageUrls = [], imagePublicIds = [] } = req.body;

    const docRef = db.collection(COLLECTION).doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Product not found' });
    }

    await docRef.update({
      name,
      category: category || 'living',
      productType: productType || '',
      price: price || '',
      material: material || '',
      dimensions: dimensions || '',
      finish: finish || '',
      warranty: warranty || '',
      description: description || '',
      imageUrl: imageUrls[0] || '',
      imagePublicId: imagePublicIds[0] || '',
      imageUrls,
      imagePublicIds,
      updatedAt: FieldValue.serverTimestamp(),
    });

    res.json({ id, message: 'Product updated successfully' });
  } catch (err) {
    console.error('Error updating product:', err);
    res.status(500).json({ error: 'Failed to update product: ' + err.message });
  }
});

// -------------------------------------------------------
// 🗑️ DELETE /api/products/:id — Delete product (admin only)
// -------------------------------------------------------
router.delete('/:id', verifyAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const docRef = db.collection(COLLECTION).doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Product not found' });
    }

    await docRef.delete();
    res.json({ id, message: 'Product deleted successfully' });
  } catch (err) {
    console.error('Error deleting product:', err);
    res.status(500).json({ error: 'Failed to delete product: ' + err.message });
  }
});

// -------------------------------------------------------
// ⭐ PATCH /api/products/:id/featured — Toggle featured (admin only)
// -------------------------------------------------------
router.patch('/:id/featured', verifyAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const docRef = db.collection(COLLECTION).doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const currentFeatured = doc.data().featured || false;
    await docRef.update({
      featured: !currentFeatured,
      updatedAt: FieldValue.serverTimestamp(),
    });

    res.json({ id, featured: !currentFeatured, message: currentFeatured ? 'Removed from featured' : 'Marked as featured' });
  } catch (err) {
    console.error('Error toggling featured:', err);
    res.status(500).json({ error: 'Failed to toggle featured: ' + err.message });
  }
});

// -------------------------------------------------------
// 👁️ PATCH /api/products/:id/view — Increment view count (public)
// -------------------------------------------------------
router.patch('/:id/view', async (req, res) => {
  try {
    const { id } = req.params;
    const docRef = db.collection(COLLECTION).doc(id);

    await docRef.update({
      viewCount: FieldValue.increment(1),
    });

    res.json({ message: 'View count incremented' });
  } catch (err) {
    console.error('Error incrementing view:', err);
    res.status(500).json({ error: 'Failed to increment view count' });
  }
});

// -------------------------------------------------------
// 📤 POST /api/products/bulk — Bulk import products (admin only)
// -------------------------------------------------------
router.post('/bulk', verifyAuth, requireAdmin, async (req, res) => {
  try {
    const { products: productsArray } = req.body;

    if (!Array.isArray(productsArray) || productsArray.length === 0) {
      return res.status(400).json({ error: 'Products array is required' });
    }

    const batch = db.batch();
    let success = 0;
    let failed = 0;

    for (const product of productsArray) {
      try {
        const urls = [];

        // Parse image URL columns (supports various header formats)
        const img1 = product.imageurl || product.image_url || product['image url'] || product['image url 1'] || product['image_url_1'] || product.imageurl1 || '';
        const img2 = product.image_url_2 || product['image url 2'] || product.imageurl2 || '';
        const img3 = product.image_url_3 || product['image url 3'] || product.imageurl3 || '';

        if (img1) urls.push(img1);
        if (img2) urls.push(img2);
        if (img3) urls.push(img3);

        // Parse comma-separated list column
        const commaSeparated = product.imageurls || product['image urls'] || '';
        if (commaSeparated) {
          commaSeparated.split(',').forEach((u) => {
            const trimmed = u.trim();
            if (trimmed && !urls.includes(trimmed)) {
              urls.push(trimmed);
            }
          });
        }

        const docRef = db.collection(COLLECTION).doc();
        batch.set(docRef, {
          name: product.name || '',
          category: product.category || 'living',
          price: product.price || '',
          material: product.material || '',
          dimensions: product.dimensions || '',
          finish: product.finish || '',
          warranty: product.warranty || '',
          description: product.description || '',
          imageUrl: urls[0] || '',
          imagePublicId: '',
          imageUrls: urls,
          imagePublicIds: [],
          featured: false,
          viewCount: 0,
          createdAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        });
        success++;
      } catch (e) {
        console.error('Error preparing bulk product:', e);
        failed++;
      }
    }

    await batch.commit();
    res.json({ success, failed, message: `${success} products imported successfully` });
  } catch (err) {
    console.error('Error bulk importing:', err);
    res.status(500).json({ error: 'Failed to bulk import: ' + err.message });
  }
});

export default router;
