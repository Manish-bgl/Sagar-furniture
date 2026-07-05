import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  onSnapshot,
  query,
  orderBy,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { uploadImage } from './productService';

const COLLECTION = 'banners';

// -------------------------------------------------------
// ➕ Add Banner
// -------------------------------------------------------
export const addBanner = async (bannerData, imageFile) => {
  let imageUrl = '';
  let imagePublicId = '';

  if (imageFile) {
    const result = await uploadImage(imageFile);
    imageUrl = result.url;
    imagePublicId = result.publicId;
  }

  const docRef = await addDoc(collection(db, COLLECTION), {
    title: bannerData.title || '',
    subtitle: bannerData.subtitle || '',
    linkUrl: bannerData.linkUrl || '',
    imageUrl,
    imagePublicId,
    active: true,
    order: bannerData.order || 1,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
};

// -------------------------------------------------------
// ✏️ Update Banner
// -------------------------------------------------------
export const updateBanner = async (id, bannerData, imageFile) => {
  let imageUrl = bannerData.imageUrl || '';
  let imagePublicId = bannerData.imagePublicId || '';

  if (imageFile) {
    const result = await uploadImage(imageFile);
    imageUrl = result.url;
    imagePublicId = result.publicId;
  }

  const docRef = doc(db, COLLECTION, id);
  await updateDoc(docRef, {
    ...bannerData,
    imageUrl,
    imagePublicId,
    updatedAt: serverTimestamp(),
  });
};

// -------------------------------------------------------
// 🗑️ Delete Banner
// -------------------------------------------------------
export const deleteBanner = async (id) => {
  await deleteDoc(doc(db, COLLECTION, id));
};

// -------------------------------------------------------
// 🔄 Toggle Banner Active/Inactive
// -------------------------------------------------------
export const toggleBannerActive = async (id, currentValue) => {
  const docRef = doc(db, COLLECTION, id);
  await updateDoc(docRef, { active: !currentValue });
};

// -------------------------------------------------------
// 📡 Real-time Banners Listener
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
