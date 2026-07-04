import { useState, useMemo } from 'react';
import HeroSection from '../components/catalog/HeroSection';
import CategoryFilter from '../components/catalog/CategoryFilter';
import SearchBar from '../components/catalog/SearchBar';
import ProductCard from '../components/catalog/ProductCard';
import ProductModal from '../components/catalog/ProductModal';
import Footer from '../components/shared/Footer';
import useProducts from '../hooks/useProducts';

const CatalogPage = () => {
  const { products, loading } = useProducts();
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesCategory = activeCategory === 'all' || p.category === activeCategory;
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        p.name?.toLowerCase().includes(q) ||
        p.material?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [products, activeCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-wood-50">
      <HeroSection />

      <section id="catalog" className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <h2 className="section-title mb-3">Our Collection</h2>
          <p className="text-wood-600 max-w-xl mx-auto">
            Every design is crafted with the finest wood and skilled craftsmanship.
            Choose your perfect furniture.
          </p>
        </div>

        <div className="space-y-5 mb-10">
          <SearchBar value={searchQuery} onChange={setSearchQuery} />
          <CategoryFilter activeCategory={activeCategory} onCategoryChange={setActiveCategory} />
        </div>

        {!loading && (
          <p className="text-wood-500 text-sm mb-6 text-center">
            {filteredProducts.length} design{filteredProducts.length !== 1 ? 's' : ''} found
          </p>
        )}

        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-wood-200 border-t-wood-600 rounded-full animate-spin" />
              <p className="text-wood-500">Loading catalog...</p>
            </div>
          </div>
        )}

        {!loading && filteredProducts.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🪑</div>
            <h3 className="font-playfair text-xl font-bold text-charcoal-900 mb-2">
              No designs found
            </h3>
            <p className="text-wood-500">
              Try a different search or contact us on WhatsApp.
            </p>
          </div>
        )}

        {!loading && filteredProducts.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onClick={setSelectedProduct}
              />
            ))}
          </div>
        )}
      </section>

      <Footer />

      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  );
};

export default CatalogPage;
