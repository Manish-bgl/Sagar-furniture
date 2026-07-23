import {
  collection,
  onSnapshot,
  query,
  orderBy,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { api } from './api';

const COLLECTION = 'products';

// -------------------------------------------------------
// 📸 Upload Image via Backend (Cloudinary signed upload — secure)
// -------------------------------------------------------
export const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append('image', file);
  return await api.upload('/api/upload', formData);
};

// -------------------------------------------------------
// 📸 Upload Multiple Images via Backend
// -------------------------------------------------------
export const uploadMultipleImages = async (files) => {
  const formData = new FormData();
  files.forEach((file) => {
    if (file) formData.append('images', file);
  });
  return await api.upload('/api/upload/multiple', formData);
};

// -------------------------------------------------------
// ➕ Add Product via Backend API (admin auth auto-included)
// -------------------------------------------------------
export const addProduct = async (productData, imageFiles = []) => {
  // Step 1: Upload images to Cloudinary via backend
  const imageUrls = [];
  const imagePublicIds = [];

  const validFiles = imageFiles.filter(Boolean);
  if (validFiles.length > 0) {
    const uploadResult = await uploadMultipleImages(validFiles);
    if (uploadResult.urls) {
      imageUrls.push(...uploadResult.urls);
      imagePublicIds.push(...uploadResult.publicIds);
    }
  }

  // Step 2: Create product in Firestore via backend
  const result = await api.post('/api/products', {
    ...productData,
    imageUrls,
    imagePublicIds,
  });

  return result.id;
};

// -------------------------------------------------------
// ✏️ Update Product via Backend API
// -------------------------------------------------------
export const updateProduct = async (id, productData, imageFiles = [], existingImages = [], existingPublicIds = []) => {
  const imageUrls = [...existingImages];
  const imagePublicIds = [...existingPublicIds];

  // Upload new images (only for slots that have new files)
  if (imageFiles && imageFiles.length > 0) {
    for (let idx = 0; idx < imageFiles.length; idx++) {
      const file = imageFiles[idx];
      if (file) {
        const uploadResult = await uploadImage(file);
        imageUrls[idx] = uploadResult.url;
        imagePublicIds[idx] = uploadResult.publicId;
      }
    }
  }

  // Filter out empty slots
  const cleanImageUrls = imageUrls.filter(Boolean);
  const cleanImagePublicIds = imagePublicIds.filter(Boolean);

  await api.put(`/api/products/${id}`, {
    ...productData,
    imageUrls: cleanImageUrls,
    imagePublicIds: cleanImagePublicIds,
  });
};

// -------------------------------------------------------
// 🗑️ Delete Product via Backend API
// -------------------------------------------------------
export const deleteProduct = async (id) => {
  await api.delete(`/api/products/${id}`);
};

// -------------------------------------------------------
// ⭐ Toggle Featured via Backend API
// -------------------------------------------------------
export const toggleFeatured = async (id) => {
  await api.patch(`/api/products/${id}/featured`);
};

// -------------------------------------------------------
// 👁️ Increment View Count via Backend API (public — no auth needed)
// -------------------------------------------------------
export const incrementViewCount = async (id) => {
  try {
    await api.patch(`/api/products/${id}/view`);
  } catch (err) {
    // Fail silently for view count
    console.error('Error incrementing view count:', err);
  }
};

// -------------------------------------------------------
// 📤 Bulk Add Products via Backend API
// -------------------------------------------------------
export const bulkAddProducts = async (productsArray) => {
  const result = await api.post('/api/products/bulk', { products: productsArray });
  return result;
};

// -------------------------------------------------------
// 📡 Real-time Products Listener (onSnapshot — stays client-side for instant updates)
// -------------------------------------------------------
export const subscribeToProducts = (callback) => {
  const q = query(collection(db, COLLECTION), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const products = snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }));
    callback(products);
  });
};
