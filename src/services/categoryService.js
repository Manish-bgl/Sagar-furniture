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

const COLLECTION = 'categories';

// Default categories to seed if collection is empty
export const DEFAULT_CATEGORIES = [
  { name: 'Living Room', emoji: '🛋️', order: 1 },
  { name: 'Bedroom', emoji: '🛏️', order: 2 },
  { name: 'Dining Room', emoji: '🍽️', order: 3 },
  { name: 'Office', emoji: '💼', order: 4 },
];

// -------------------------------------------------------
// ➕ Add Category
// -------------------------------------------------------
export const addCategory = async (name, emoji = '📦', order = 99) => {
  const id = name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
  const docRef = await addDoc(collection(db, COLLECTION), {
    name,
    emoji,
    slug: id,
    order,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
};

// -------------------------------------------------------
// ✏️ Update Category
// -------------------------------------------------------
export const updateCategory = async (id, name, emoji) => {
  const docRef = doc(db, COLLECTION, id);
  const slug = name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
  await updateDoc(docRef, { name, emoji, slug, updatedAt: serverTimestamp() });
};

// -------------------------------------------------------
// 🗑️ Delete Category
// -------------------------------------------------------
export const deleteCategory = async (id) => {
  await deleteDoc(doc(db, COLLECTION, id));
};

// -------------------------------------------------------
// 🌱 Seed Default Categories (if collection empty)
// -------------------------------------------------------
export const seedDefaultCategories = async () => {
  for (const cat of DEFAULT_CATEGORIES) {
    await addCategory(cat.name, cat.emoji, cat.order);
  }
};

// -------------------------------------------------------
// 📡 Real-time Categories Listener
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
