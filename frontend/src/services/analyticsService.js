// frontend/src/services/analyticsService.js
// Tracks user events: WhatsApp clicks, catalog downloads, search queries
import { collection, addDoc, serverTimestamp, query, orderBy, onSnapshot, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';

const COLLECTION = 'events';

// ─── Track an event (fire and forget) ───────────────────────────
export const trackEvent = async (type, data = {}) => {
  try {
    await addDoc(collection(db, COLLECTION), {
      type,           // 'whatsapp_click' | 'catalog_download' | 'search' | 'category_download'
      ...data,        // any extra context (productName, productId, query, category, etc.)
      timestamp: serverTimestamp(),
      // Best-effort device info
      device: /Mobi|Android/i.test(navigator.userAgent) ? 'mobile' : 'desktop',
    });
  } catch (err) {
    // Never block user action due to analytics failure
    console.warn('Analytics track failed:', err.message);
  }
};

// ─── Convenience wrappers ───────────────────────────────────────

export const trackWhatsApp = (productId, productName, category) =>
  trackEvent('whatsapp_click', { productId, productName, category });

export const trackCatalogDownload = (category = 'all') =>
  trackEvent('catalog_download', { category });

export const trackSearch = (searchQuery) =>
  trackEvent('search', { query: searchQuery });

// ─── Admin: Real-time events listener ──────────────────────────
export const subscribeToEvents = (callback) => {
  const q = query(collection(db, COLLECTION), orderBy('timestamp', 'desc'));
  return onSnapshot(
    q,
    (snapshot) => {
      const events = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      callback(events);
    },
    (error) => {
      if (error.code === 'permission-denied') {
        console.warn('Events: insufficient permissions — check admin_users collection');
        callback([]);
      } else {
        console.error('Events listener error:', error);
      }
    }
  );
};

// ─── Admin: Get all events once (for stats) ─────────────────────
export const getEventStats = async () => {
  const snapshot = await getDocs(collection(db, COLLECTION));
  const events = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));

  const whatsappClicks = events.filter(e => e.type === 'whatsapp_click');
  const downloads = events.filter(e => e.type === 'catalog_download');
  const searches = events.filter(e => e.type === 'search');

  // Top products by WhatsApp clicks
  const productClickMap = {};
  whatsappClicks.forEach(e => {
    if (e.productName) {
      productClickMap[e.productName] = (productClickMap[e.productName] || 0) + 1;
    }
  });
  const topProducts = Object.entries(productClickMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count]) => ({ name, count }));

  // Top searches
  const searchMap = {};
  searches.forEach(e => {
    if (e.query) {
      searchMap[e.query] = (searchMap[e.query] || 0) + 1;
    }
  });
  const topSearches = Object.entries(searchMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([query, count]) => ({ query, count }));

  return {
    totalWhatsAppClicks: whatsappClicks.length,
    totalDownloads: downloads.length,
    totalSearches: searches.length,
    topProducts,
    topSearches,
    recentEvents: events.slice(0, 20),
  };
};
