import { useState, useEffect } from 'react';
import { subscribeToBanners } from '../services/bannerService';

const useBanners = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToBanners((data) => {
      setBanners(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return { banners, loading };
};

export default useBanners;
