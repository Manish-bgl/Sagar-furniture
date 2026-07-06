import { useState, useMemo, useEffect } from 'react';
import HeroSection from '../components/catalog/HeroSection';
import CategoryFilter from '../components/catalog/CategoryFilter';
import SearchBar from '../components/catalog/SearchBar';
import ProductCard from '../components/catalog/ProductCard';
import ProductModal from '../components/catalog/ProductModal';
import Footer from '../components/shared/Footer';
import useProducts from '../hooks/useProducts';
import useCategories from '../hooks/useCategories';
import useBanners from '../hooks/useBanners';
import { incrementViewCount } from '../services/productService';
import { trackVisit } from '../services/visitorService';

const PRODUCTS_PER_PAGE = 50;

const CatalogPage = () => {
  const { products, loading } = useProducts();
  const { categories } = useCategories();
  const { banners } = useBanners();

  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Track visitor on mount
  useEffect(() => {
    trackVisit();
  }, []);

  // Listen for products load to trigger deep linking
  useEffect(() => {
    if (!loading && products.length > 0) {
      const params = new URLSearchParams(window.location.search);
      const productId = params.get('product');
      if (productId) {
        const found = products.find(p => p.id === productId);
        if (found) {
          setSelectedProduct(found);
        }
      }
    }
  }, [loading, products]);

  // Reset to page 1 when filter/search changes
  const handleCategoryChange = (cat) => {
    setActiveCategory(cat);
    setCurrentPage(1);
  };

  const handleSearchChange = (q) => {
    setSearchQuery(q);
    setCurrentPage(1);
  };

  // Trigger view count increment and url updates
  const handleViewProduct = (product) => {
    setSelectedProduct(product);
    
    // Update deep link query parameter in browser URL address bar
    const newUrl = `${window.location.pathname}?product=${product.id}`;
    window.history.pushState({ path: newUrl }, '', newUrl);

    try {
      incrementViewCount(product.id);
    } catch (e) {
      console.error('Error incrementing view count:', e);
    }
  };

  const handleCloseModal = () => {
    setSelectedProduct(null);
    // Clear deep link query parameter
    const newUrl = window.location.pathname;
    window.history.pushState({ path: newUrl }, '', newUrl);
  };

  // Featured Products (show at top when no active search/filters)
  const featuredProducts = useMemo(() => {
    return products.filter((p) => p.featured).slice(0, 6);
  }, [products]);

  // Recently Uploaded Products (show top 3 newest products)
  const recentlyAddedProducts = useMemo(() => {
    return products.slice(0, 3);
  }, [products]);

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

  const showFeaturedSection = activeCategory === 'all' && !searchQuery && featuredProducts.length > 0;
  const showRecentSection = activeCategory === 'all' && !searchQuery && recentlyAddedProducts.length > 0;

  return (
    <div className="min-h-screen bg-wood-50 flex flex-col">
      <HeroSection banners={banners} />

      <section id="catalog" className="flex-1 max-w-6xl mx-auto w-full px-4 py-12">
        
        {/* ⭐ Featured Products Showcase Section */}
        {showFeaturedSection && (
          <div className="mb-16 animate-fade-in">
            <div className="text-center mb-8">
              <span className="text-xs bg-yellow-100 text-yellow-700 font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                ⭐ Handpicked Exclusives
              </span>
              <h2 className="section-title mt-2 mb-3">Featured Designs</h2>
              <div className="w-12 h-1 bg-wood-500 mx-auto rounded-full" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard
                  key={`featured-${product.id}`}
                  product={product}
                  categories={categories}
                  onClick={handleViewProduct}
                />
              ))}
            </div>
          </div>
        )}

        <div className="text-center mb-10">
          <h2 className="section-title mb-3">Our Complete Collection</h2>
          <p className="text-wood-600 max-w-xl mx-auto">
            Every design is crafted with the finest wood and skilled craftsmanship.
            Choose your perfect furniture.
          </p>
        </div>

        <div className="space-y-5 mb-10">
          <SearchBar value={searchQuery} onChange={handleSearchChange} />
          <CategoryFilter 
            categories={categories} 
            activeCategory={activeCategory} 
            onCategoryChange={handleCategoryChange} 
          />
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
                categories={categories}
                onClick={handleViewProduct}
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

        {/* 🆕 Newly Uploaded Products Section */}
        {showRecentSection && (
          <div className="mt-20 border-t border-wood-200 pt-12 animate-fade-in">
            <div className="text-center mb-8">
              <span className="text-xs bg-wood-100 text-wood-700 font-semibold px-3 py-1 rounded-full uppercase tracking-wider">
                🆕 New Arrivals
              </span>
              <h2 className="section-title mt-2 mb-3">Recently Added</h2>
              <div className="w-12 h-1 bg-wood-400 mx-auto rounded-full" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentlyAddedProducts.map((product) => (
                <ProductCard
                  key={`recent-${product.id}`}
                  product={product}
                  categories={categories}
                  onClick={handleViewProduct}
                />
              ))}
            </div>
          </div>
        )}
      </section>

      <Footer />

      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          products={products}
          categories={categories}
          onClose={handleCloseModal}
          onProductSelect={handleViewProduct}
        />
      )}
    </div>
  );
};

export default CatalogPage;
