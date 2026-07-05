import { collection, addDoc, serverTimestamp, onSnapshot, query, limit } from 'firebase/firestore';
import { db } from '../firebase/config';

const COLLECTION = 'visits';

// -------------------------------------------------------
// 📈 Track Website Visitor
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
      await addDoc(collection(db, COLLECTION), {
        visitorId,
        userAgent: navigator.userAgent,
        timestamp: serverTimestamp(),
      });
      sessionStorage.setItem('sf_session_tracked', 'true');
    }
  } catch (error) {
    console.error('Error tracking visit:', error);
  }
};

// -------------------------------------------------------
// 📡 Real-time Visits Listener (Admin Stats)
// -------------------------------------------------------
export const subscribeToVisits = (callback) => {
  // Query visits collection
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
