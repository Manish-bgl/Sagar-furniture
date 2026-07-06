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
  increment,
  writeBatch,
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
// ➕ नया Product Firestore में Add करें (Supports up to 3 images)
// -------------------------------------------------------
export const addProduct = async (productData, imageFiles = []) => {
  const imageUrls = [];
  const imagePublicIds = [];

  if (imageFiles && imageFiles.length > 0) {
    const uploadPromises = imageFiles.map(async (file) => {
      if (!file) return null;
      return await uploadImage(file);
    });

    const results = await Promise.all(uploadPromises);
    results.forEach((res) => {
      if (res) {
        imageUrls.push(res.url);
        imagePublicIds.push(res.publicId);
      }
    });
  }

  const docRef = await addDoc(collection(db, COLLECTION), {
    ...productData,
    imageUrl: imageUrls[0] || '', // Fallback first image for backwards compatibility
    imagePublicId: imagePublicIds[0] || '',
    imageUrls,
    imagePublicIds,
    featured: productData.featured || false,
    viewCount: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
};

// -------------------------------------------------------
// ✏️ Product Update करें (Supports up to 3 images)
// -------------------------------------------------------
export const updateProduct = async (id, productData, imageFiles = [], existingImages = []) => {
  const imageUrls = [...existingImages];
  const imagePublicIds = [...(productData.imagePublicIds || [])];

  if (imageFiles && imageFiles.length > 0) {
    const uploadPromises = imageFiles.map(async (file, idx) => {
      if (!file) return null;
      const res = await uploadImage(file);
      return { res, idx };
    });

    const results = await Promise.all(uploadPromises);
    results.forEach((item) => {
      if (item && item.res) {
        imageUrls[item.idx] = item.res.url;
        imagePublicIds[item.idx] = item.res.publicId;
      }
    });
  }

  // Filter out any empty spaces in urls
  const cleanImageUrls = imageUrls.filter(Boolean);
  const cleanImagePublicIds = imagePublicIds.filter(Boolean);

  const docRef = doc(db, COLLECTION, id);
  await updateDoc(docRef, {
    ...productData,
    imageUrl: cleanImageUrls[0] || '', // Fallback first image
    imagePublicId: cleanImagePublicIds[0] || '',
    imageUrls: cleanImageUrls,
    imagePublicIds: cleanImagePublicIds,
    updatedAt: serverTimestamp(),
  });
};

// -------------------------------------------------------
// 🗑️ Product Delete करें (Firestore से)
// -------------------------------------------------------
export const deleteProduct = async (id) => {
  await deleteDoc(doc(db, COLLECTION, id));
};

// -------------------------------------------------------
// ⭐ Featured Toggle
// -------------------------------------------------------
export const toggleFeatured = async (id, currentValue) => {
  const docRef = doc(db, COLLECTION, id);
  await updateDoc(docRef, {
    featured: !currentValue,
    updatedAt: serverTimestamp(),
  });
};

// -------------------------------------------------------
// 👁️ View Count Increment (customer product view)
// -------------------------------------------------------
export const incrementViewCount = async (id) => {
  const docRef = doc(db, COLLECTION, id);
  await updateDoc(docRef, {
    viewCount: increment(1),
  });
};

// -------------------------------------------------------
// 📤 Bulk Add Products (from CSV)
// -------------------------------------------------------
export const bulkAddProducts = async (productsArray) => {
  const batch = writeBatch(db);
  const results = { success: 0, failed: 0 };

  for (const product of productsArray) {
    try {
      const docRef = doc(collection(db, COLLECTION));
      batch.set(docRef, {
        name: product.name || '',
        category: product.category || 'living',
        price: product.price || '',
        material: product.material || '',
        dimensions: product.dimensions || '',
        finish: product.finish || '',
        warranty: product.warranty || '',
        description: product.description || '',
        imageUrl: '',
        imagePublicId: '',
        featured: false,
        viewCount: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      results.success++;
    } catch {
      results.failed++;
    }
  }

  await batch.commit();
  return results;
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
