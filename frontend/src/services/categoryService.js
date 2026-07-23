import {
  collection,
  onSnapshot,
  query,
  orderBy,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { api } from './api';

const COLLECTION = 'categories';

// Default categories (for reference only — seeding goes through backend)
export const DEFAULT_CATEGORIES = [
  { name: 'Living Room', emoji: '🛋️', order: 1 },
  { name: 'Bedroom', emoji: '🛏️', order: 2 },
  { name: 'Dining Room', emoji: '🍽️', order: 3 },
  { name: 'Office', emoji: '💼', order: 4 },
];

// -------------------------------------------------------
// ➕ Add Category via Backend API
// -------------------------------------------------------
export const addCategory = async (name, emoji = '📦', order = 99) => {
  const result = await api.post('/api/categories', { name, emoji, order });
  return result.id;
};

// -------------------------------------------------------
// ✏️ Update Category via Backend API
// -------------------------------------------------------
export const updateCategory = async (id, name, emoji) => {
  await api.put(`/api/categories/${id}`, { name, emoji });
};

// -------------------------------------------------------
// 🗑️ Delete Category via Backend API
// -------------------------------------------------------
export const deleteCategory = async (id) => {
  await api.delete(`/api/categories/${id}`);
};

// -------------------------------------------------------
// 🌱 Seed Default Categories via Backend API
// -------------------------------------------------------
export const seedDefaultCategories = async () => {
  await api.post('/api/categories/seed');
};

// -------------------------------------------------------
// 📡 Real-time Categories Listener (stays client-side)
// -------------------------------------------------------
export const subscribeToCategories = (callback) => {
  const q = query(collection(db, COLLECTION), orderBy('order', 'asc'));
  return onSnapshot(q, (snapshot) => {
    const categories = snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }));
    callback(categories);
  });
};
