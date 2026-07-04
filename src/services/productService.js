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

const COLLECTION = 'products';

// -------------------------------------------------------
// 📸 Cloudinary पर Image Upload (100% Free - 25GB)
// -------------------------------------------------------
export const uploadImage = async (file) => {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || cloudName === 'your_cloud_name_here') {
    throw new Error('Cloudinary Cloud Name set नहीं है। .env file में VITE_CLOUDINARY_CLOUD_NAME डालें।');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);
  formData.append('folder', 'sagar-furniture');

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    { method: 'POST', body: formData }
  );

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || 'Image upload failed');
  }

  const data = await response.json();
  return {
    url: data.secure_url,         // Image का URL (Firestore में save होगा)
    publicId: data.public_id,    // Delete के लिए (optional)
  };
};

// -------------------------------------------------------
// ➕ नया Product Firestore में Add करें
// -------------------------------------------------------
export const addProduct = async (productData, imageFile) => {
  let imageUrl = '';
  let imagePublicId = '';

  if (imageFile) {
    const result = await uploadImage(imageFile);
    imageUrl = result.url;
    imagePublicId = result.publicId;
  }

  const docRef = await addDoc(collection(db, COLLECTION), {
    ...productData,
    imageUrl,
    imagePublicId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
};

// -------------------------------------------------------
// ✏️ Product Update करें
// -------------------------------------------------------
export const updateProduct = async (id, productData, imageFile) => {
  let imageUrl = productData.imageUrl || '';
  let imagePublicId = productData.imagePublicId || '';

  if (imageFile) {
    const result = await uploadImage(imageFile);
    imageUrl = result.url;
    imagePublicId = result.publicId;
  }

  const docRef = doc(db, COLLECTION, id);
  await updateDoc(docRef, {
    ...productData,
    imageUrl,
    imagePublicId,
    updatedAt: serverTimestamp(),
  });
};

// -------------------------------------------------------
// 🗑️ Product Delete करें (Firestore से)
// -------------------------------------------------------
export const deleteProduct = async (id) => {
  await deleteDoc(doc(db, COLLECTION, id));
  // Note: Cloudinary image delete के लिए backend चाहिए
  // Free plan में manually Cloudinary dashboard से delete कर सकते हैं
};

// -------------------------------------------------------
// 📡 Real-time Products Listener (onSnapshot)
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
