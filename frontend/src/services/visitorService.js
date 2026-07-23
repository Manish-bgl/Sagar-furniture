import { collection, onSnapshot, query } from 'firebase/firestore';
import { db } from '../firebase/config';
import { api } from './api';

const COLLECTION = 'visits';

// -------------------------------------------------------
// 📈 Track Website Visitor via Backend API (public)
// -------------------------------------------------------
export const trackVisit = async () => {
  try {
    // Check for unique visitor ID in localStorage
    let visitorId = localStorage.getItem('sf_visitor_id');
    if (!visitorId) {
      visitorId = 'vis_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
      localStorage.setItem('sf_visitor_id', visitorId);
    }

    // Use sessionStorage to only track one visit count per browser tab session
    const sessionTracked = sessionStorage.getItem('sf_session_tracked');
    if (!sessionTracked) {
      await api.post('/api/visits', { visitorId });
      sessionStorage.setItem('sf_session_tracked', 'true');
    }
  } catch (error) {
    console.error('Error tracking visit:', error);
  }
};

// -------------------------------------------------------
// 📡 Real-time Visits Listener (Admin Stats — stays client-side)
// -------------------------------------------------------
export const subscribeToVisits = (callback) => {
  const q = query(collection(db, COLLECTION));
  return onSnapshot(q, (snapshot) => {
    const visits = snapshot.docs.map((d) => d.data());

    // Calculate unique visitors
    const uniqueIds = new Set(visits.map(v => v.visitorId));

    callback({
      totalVisits: visits.length,
      uniqueVisitors: uniqueIds.size,
      visits: visits,
    });
  });
};
