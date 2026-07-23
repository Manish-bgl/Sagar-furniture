// server/src/middleware/auth.js
// Firebase Auth token verification + admin role check
import { admin, db } from '../config/firebase.js';

/**
 * Middleware: verifyAuth
 * - Extracts Firebase ID token from Authorization header
 * - Verifies token with Firebase Admin SDK
 * - Attaches decoded user to req.user
 */
export const verifyAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized — No token provided' });
  }

  const idToken = authHeader.split('Bearer ')[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedToken;
    next();
  } catch (err) {
    console.error('Auth verification failed:', err.message);
    return res.status(401).json({ error: 'Unauthorized — Invalid or expired token' });
  }
};

/**
 * Middleware: requireAdmin
 * - Must be used AFTER verifyAuth
 * - Checks if user's email exists in admin_users Firestore collection
 * - Also checks against ALLOWED_ADMIN_EMAIL env var as fallback
 */
export const requireAdmin = async (req, res, next) => {
  if (!req.user || !req.user.email) {
    return res.status(403).json({ error: 'Forbidden — No user email found' });
  }

  const email = req.user.email;

  try {
    // Check admin_users collection in Firestore (primary check)
    const adminDoc = await db.collection('admin_users').doc(email).get();

    if (adminDoc.exists) {
      return next();
    }

    // Fallback: check env variable
    const allowedEmail = process.env.ALLOWED_ADMIN_EMAIL;
    if (allowedEmail && email === allowedEmail) {
      return next();
    }

    return res.status(403).json({ error: 'Forbidden — You do not have admin access' });
  } catch (err) {
    console.error('Admin check failed:', err.message);
    return res.status(500).json({ error: 'Server error during authorization' });
  }
};
