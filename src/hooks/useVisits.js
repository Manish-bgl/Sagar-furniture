import { useState, useEffect } from 'react';
import { subscribeToVisits } from '../services/visitorService';

const useVisits = () => {
  const [stats, setStats] = useState({ totalVisits: 0, uniqueVisitors: 0, visits: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToVisits((data) => {
      setStats(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return { stats, loading };
};

export default useVisits;
