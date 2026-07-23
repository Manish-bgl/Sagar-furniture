import {
  collection,
  onSnapshot,
  query,
  orderBy,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { api } from './api';

const COLLECTION = 'productTypes';

// Default item types (for reference only — seeding goes through backend)
export const DEFAULT_PRODUCT_TYPES = [
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
// ➕ Add Item Type via Backend API
// -------------------------------------------------------
export const addProductType = async (label, emoji = '📦', keywords = '') => {
  const result = await api.post('/api/product-types', { label, emoji, keywords });
  return result.id;
};

// -------------------------------------------------------
// 🗑️ Delete Item Type via Backend API
// -------------------------------------------------------
export const deleteProductType = async (id) => {
  await api.delete(`/api/product-types/${id}`);
};

// -------------------------------------------------------
// 🌱 Seed Default Item Types via Backend API
// -------------------------------------------------------
export const seedDefaultProductTypes = async () => {
  await api.post('/api/product-types/seed');
};

// -------------------------------------------------------
// 📡 Real-time Item Types Listener (stays client-side)
// -------------------------------------------------------
export const subscribeToProductTypes = (callback) => {
  const q = query(collection(db, COLLECTION), orderBy('createdAt', 'asc'));
  return onSnapshot(q, (snapshot) => {
    const items = snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }));
    callback(items);
  });
};
