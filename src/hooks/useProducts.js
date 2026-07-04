import { useState, useEffect } from 'react';
import { subscribeToProducts } from '../services/productService';

// Real-time Firestore hook — Manager ऐड करे, Customer को तुरंत दिखे
const useProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = subscribeToProducts((data) => {
      setProducts(data);
      setLoading(false);
    });

    return () => unsubscribe(); // Component unmount पर listener हटाएं
  }, []);

  return { products, loading, error };
};

export default useProducts;
