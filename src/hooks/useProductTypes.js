import { useState, useEffect } from 'react';
import { subscribeToProductTypes } from '../services/productTypeService';

const useProductTypes = () => {
  const [productTypes, setProductTypes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToProductTypes((data) => {
      setProductTypes(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return { productTypes, loading };
};

export default useProductTypes;
