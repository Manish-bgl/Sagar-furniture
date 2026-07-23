import {
  collection,
  onSnapshot,
  query,
  orderBy,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { api } from './api';
import { uploadImage } from './productService';

const COLLECTION = 'banners';

// -------------------------------------------------------
// ➕ Add Banner via Backend API
// -------------------------------------------------------
export const addBanner = async (bannerData, imageFile) => {
  let imageUrl = '';
  let imagePublicId = '';

  if (imageFile) {
    const result = await uploadImage(imageFile);
    imageUrl = result.url;
    imagePublicId = result.publicId;
  }

  const apiResult = await api.post('/api/banners', {
    ...bannerData,
    imageUrl,
    imagePublicId,
  });
  return apiResult.id;
};

// -------------------------------------------------------
// ✏️ Update Banner via Backend API
// -------------------------------------------------------
export const updateBanner = async (id, bannerData, imageFile) => {
  let imageUrl = bannerData.imageUrl || '';
  let imagePublicId = bannerData.imagePublicId || '';

  if (imageFile) {
    const result = await uploadImage(imageFile);
    imageUrl = result.url;
    imagePublicId = result.publicId;
  }

  await api.put(`/api/banners/${id}`, {
    ...bannerData,
    imageUrl,
    imagePublicId,
  });
};

// -------------------------------------------------------
// 🗑️ Delete Banner via Backend API
// -------------------------------------------------------
export const deleteBanner = async (id) => {
  await api.delete(`/api/banners/${id}`);
};

// -------------------------------------------------------
// 🔄 Toggle Banner Active/Inactive via Backend API
// -------------------------------------------------------
export const toggleBannerActive = async (id) => {
  await api.patch(`/api/banners/${id}/toggle`);
};

// -------------------------------------------------------
// 📡 Real-time Banners Listener (stays client-side)
// -------------------------------------------------------
export const subscribeToBanners = (callback) => {
  const q = query(collection(db, COLLECTION), orderBy('order', 'asc'));
  return onSnapshot(q, (snapshot) => {
    const banners = snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }));
    callback(banners);
  });
};
