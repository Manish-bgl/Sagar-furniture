import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  onSnapshot,
  query,
  orderBy,
} from 'firebase/firestore';
import { db } from '../firebase/config';

const COLLECTION = 'productTypes';

// Default item types to seed if collection is empty
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
// ➕ Add Item Type (Product Type)
// -------------------------------------------------------
export const addProductType = async (label, emoji = '📦', keywords = '') => {
  const key = label.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
  const docRef = await addDoc(collection(db, COLLECTION), {
    key,
    label,
    emoji,
    keywords,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
};

// -------------------------------------------------------
// 🗑️ Delete Item Type
// -------------------------------------------------------
export const deleteProductType = async (id) => {
  await deleteDoc(doc(db, COLLECTION, id));
};

// -------------------------------------------------------
// 🌱 Seed Default Item Types
// -------------------------------------------------------
export const seedDefaultProductTypes = async () => {
  for (const item of DEFAULT_PRODUCT_TYPES) {
    await addProductType(item.label, item.emoji, item.keywords);
  }
};

// -------------------------------------------------------
// 📡 Real-time Item Types Listener
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
