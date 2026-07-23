// server/src/config/firebase.js
// Firebase Admin SDK — server-side Firestore access with full privileges
import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';

let db;

function initializeFirebase() {
  if (admin.apps.length > 0) {
    db = admin.firestore();
    return;
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT;

  let serviceAccount = null;

  // 1. Try loading from service account path if configured
  if (serviceAccountPath) {
    try {
      const resolvedPath = path.resolve(process.cwd(), serviceAccountPath);
      if (fs.existsSync(resolvedPath)) {
        const fileContent = fs.readFileSync(resolvedPath, 'utf8');
        serviceAccount = JSON.parse(fileContent);
        console.log(`✅ Firebase Admin loaded credentials from: ${serviceAccountPath}`);
      }
    } catch (err) {
      console.error(`❌ Failed to read Firebase Service Account from path (${serviceAccountPath}):`, err.message);
    }
  }

  // 2. Fallback to inline JSON string in environment variable
  if (!serviceAccount && serviceAccountJson && serviceAccountJson.trim().startsWith('{')) {
    try {
      serviceAccount = JSON.parse(serviceAccountJson);
      console.log('✅ Firebase Admin loaded credentials from env string');
    } catch (err) {
      console.error('❌ Failed to parse FIREBASE_SERVICE_ACCOUNT JSON string:', err.message);
    }
  }

  if (serviceAccount) {
    try {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId,
      });
      console.log('✅ Firebase Admin SDK initialized successfully');
    } catch (err) {
      console.error('❌ Failed to initialize Firebase Admin cert:', err.message);
      console.log('⚠️  Falling back to application default credentials...');
      admin.initializeApp({ projectId });
    }
  } else {
    // 3. Fallback: use application default credentials (works on GCP/Cloud Run/implicit auth)
    console.log('⚠️  No Firebase Service Account credentials loaded. Using application default credentials.');
    admin.initializeApp({ projectId });
  }

  db = admin.firestore();
}

initializeFirebase();

export { admin, db };
