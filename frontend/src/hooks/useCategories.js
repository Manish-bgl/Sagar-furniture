import { useState, useEffect } from 'react';
import { subscribeToCategories } from '../services/categoryService';

const useCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToCategories((data) => {
      setCategories(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return { categories, loading };
};

export default useCategories;
