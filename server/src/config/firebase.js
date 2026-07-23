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
  const serviceAccountEnvPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT;

  let serviceAccount = null;

  // 1. Try Render Secret File path (most reliable for production)
  const renderSecretPath = '/etc/secrets/serviceAccountKey.json';
  const pathsToTry = [
    renderSecretPath,                                          // Render Secret File (production)
    serviceAccountEnvPath && path.resolve(process.cwd(), serviceAccountEnvPath), // custom env path
    path.resolve(process.cwd(), './serviceAccountKey.json'),  // local dev fallback
  ].filter(Boolean);

  for (const filePath of pathsToTry) {
    try {
      if (fs.existsSync(filePath)) {
        const fileContent = fs.readFileSync(filePath, 'utf8');
        serviceAccount = JSON.parse(fileContent);
        console.log(`✅ Firebase Admin loaded credentials from: ${filePath}`);
        break;
      }
    } catch (err) {
      console.warn(`⚠️  Could not load service account from ${filePath}:`, err.message);
    }
  }

  // 2. Fallback: try inline JSON string from env var
  if (!serviceAccount && serviceAccountJson) {
    try {
      // Handle both escaped and unescaped JSON strings
      const cleaned = serviceAccountJson.trim();
      serviceAccount = JSON.parse(cleaned);
      console.log('✅ Firebase Admin loaded credentials from FIREBASE_SERVICE_ACCOUNT env var');
    } catch (err) {
      console.error('❌ Failed to parse FIREBASE_SERVICE_ACCOUNT JSON string:', err.message);
      console.error('   Tip: Use Render Secret Files instead — upload serviceAccountKey.json at /etc/secrets/serviceAccountKey.json');
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
      console.error('❌ Failed to initialize Firebase Admin:', err.message);
      admin.initializeApp({ projectId });
    }
  } else {
    console.warn('⚠️  No Firebase credentials found. Using application default credentials.');
    admin.initializeApp({ projectId });
  }

  db = admin.firestore();
}

initializeFirebase();

export { admin, db };
