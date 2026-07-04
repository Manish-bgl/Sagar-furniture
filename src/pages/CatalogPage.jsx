import { useState, useMemo } from 'react';
import HeroSection from '../components/catalog/HeroSection';
import CategoryFilter from '../components/catalog/CategoryFilter';
import SearchBar from '../components/catalog/SearchBar';
import ProductCard from '../components/catalog/ProductCard';
import ProductModal from '../components/catalog/ProductModal';
import Footer from '../components/shared/Footer';
import useProducts from '../hooks/useProducts';

const PRODUCTS_PER_PAGE = 50;

const CatalogPage = () => {
  const { products, loading } = useProducts();
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Reset to page 1 when filter/search changes
  const handleCategoryChange = (cat) => {
    setActiveCategory(cat);
    setCurrentPage(1);
  };

  const handleSearchChange = (q) => {
    setSearchQuery(q);
    setCurrentPage(1);
  };

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

  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * PRODUCTS_PER_PAGE;
    return filteredProducts.slice(start, start + PRODUCTS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  const scrollToTop = () => {
    document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    scrollToTop();
  };

  // Generate page numbers with ellipsis for large page counts
  const getPageNumbers = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (currentPage <= 4) {
      return [1, 2, 3, 4, 5, '...', totalPages];
    }
    if (currentPage >= totalPages - 3) {
      return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }
    return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
  };

  return (
    <div className="min-h-screen bg-wood-50 flex flex-col">
      <HeroSection />

      <section id="catalog" className="flex-1 max-w-6xl mx-auto w-full px-4 py-12">
        <div className="text-center mb-10">
          <h2 className="section-title mb-3">Our Collection</h2>
          <p className="text-wood-600 max-w-xl mx-auto">
            Every design is crafted with the finest wood and skilled craftsmanship.
            Choose your perfect furniture.
          </p>
        </div>

        <div className="space-y-5 mb-10">
          <SearchBar value={searchQuery} onChange={handleSearchChange} />
          <CategoryFilter activeCategory={activeCategory} onCategoryChange={handleCategoryChange} />
        </div>

        {!loading && (
          <p className="text-wood-500 text-sm mb-6 text-center">
            {filteredProducts.length} design{filteredProducts.length !== 1 ? 's' : ''} found
            {totalPages > 1 && ` · Page ${currentPage} of ${totalPages}`}
          </p>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-wood-200 border-t-wood-600 rounded-full animate-spin" />
              <p className="text-wood-500">Loading catalog...</p>
            </div>
          </div>
        )}

        {/* Empty State */}
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

        {/* Product Grid */}
        {!loading && paginatedProducts.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onClick={setSelectedProduct}
              />
            ))}
          </div>
        )}

        {/* Pagination Controls */}
        {!loading && totalPages > 1 && (
          <div className="mt-12 flex flex-col items-center gap-4">
            <div className="flex items-center gap-2 flex-wrap justify-center">
              {/* Prev Button */}
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 rounded-xl border-2 border-wood-200 bg-white text-wood-700 font-medium text-sm
                           hover:border-wood-500 hover:text-wood-900 transition-all duration-200
                           disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
              >
                ← Prev
              </button>

              {/* Page Numbers */}
              {getPageNumbers().map((page, idx) =>
                page === '...' ? (
                  <span key={`ellipsis-${idx}`} className="px-2 py-2 text-wood-400 text-sm">
                    ...
                  </span>
                ) : (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`w-10 h-10 rounded-xl font-semibold text-sm transition-all duration-200
                      ${currentPage === page
                        ? 'bg-wood-gradient text-white shadow-wood scale-110 border-2 border-wood-600'
                        : 'border-2 border-wood-200 bg-white text-wood-700 hover:border-wood-400 hover:scale-105'
                      }`}
                  >
                    {page}
                  </button>
                )
              )}

              {/* Next Button */}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 rounded-xl border-2 border-wood-200 bg-white text-wood-700 font-medium text-sm
                           hover:border-wood-500 hover:text-wood-900 transition-all duration-200
                           disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
              >
                Next →
              </button>
            </div>

            {/* Page info */}
            <p className="text-wood-400 text-xs">
              Showing {((currentPage - 1) * PRODUCTS_PER_PAGE) + 1}–{Math.min(currentPage * PRODUCTS_PER_PAGE, filteredProducts.length)} of {filteredProducts.length} designs
            </p>
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
