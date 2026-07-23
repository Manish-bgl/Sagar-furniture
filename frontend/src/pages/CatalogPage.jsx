import { useState, useMemo, useEffect } from 'react';
import HeroSection from '../components/catalog/HeroSection';
import CategoryFilter from '../components/catalog/CategoryFilter';
import ProductTypeFilter from '../components/catalog/ProductTypeFilter';
import SearchBar from '../components/catalog/SearchBar';
import ProductCard from '../components/catalog/ProductCard';
import ProductModal from '../components/catalog/ProductModal';
import Footer from '../components/shared/Footer';
import useProducts from '../hooks/useProducts';
import useCategories from '../hooks/useCategories';
import useProductTypes from '../hooks/useProductTypes';
import useBanners from '../hooks/useBanners';
import { incrementViewCount } from '../services/productService';
import { trackVisit } from '../services/visitorService';

const PRODUCTS_PER_PAGE = 50;

const CatalogPage = () => {
  const { products, loading } = useProducts();
  const { categories } = useCategories();
  const { productTypes } = useProductTypes();
  const { banners } = useBanners();

  const [activeCategory, setActiveCategory] = useState('all');
  const [activeProductType, setActiveProductType] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Track visitor on mount & force clean dark mode
  useEffect(() => {
    trackVisit();
    document.documentElement.classList.remove('dark');
    localStorage.removeItem('sagar-dark-mode');
  }, []);

  // 🛡️ Product Protection & Anti-Screenshot Handlers (Only for Customer view)
  useEffect(() => {
    // Block print media
    document.body.classList.add('no-print');

    const preventContextMenu = (e) => e.preventDefault();
    document.addEventListener('contextmenu', preventContextMenu);

    const handleKeyDown = (e) => {
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j' || e.key === 'C' || e.key === 'c')) ||
        (e.metaKey && e.altKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j' || e.key === 'C' || e.key === 'c')) ||
        (e.ctrlKey && (e.key === 'U' || e.key === 'u')) ||
        ((e.ctrlKey || e.metaKey) && (e.key === 'S' || e.key === 's')) ||
        ((e.ctrlKey || e.metaKey) && (e.key === 'P' || e.key === 'p')) ||
        ((e.ctrlKey || e.metaKey) && (e.key === 'C' || e.key === 'c'))
      ) {
        e.preventDefault();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    const handleKeyUp = async (e) => {
      if (e.key === 'PrintScreen' || e.key === 'PrtScn') {
        try {
          await navigator.clipboard.writeText('Screenshots of products are restricted for safety.');
        } catch (_) {}
      }
    };
    window.addEventListener('keyup', handleKeyUp);

    const handleBlur = () => {
      document.getElementById('root')?.classList.add('screen-blur');
    };
    const handleFocus = () => {
      document.getElementById('root')?.classList.remove('screen-blur');
    };
    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.body.classList.remove('no-print');
      document.removeEventListener('contextmenu', preventContextMenu);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
      document.getElementById('root')?.classList.remove('screen-blur');
    };
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

  const handleProductTypeChange = (type) => {
    setActiveProductType(type);
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
    let result = products.filter((p) => {
      const matchesCategory = activeCategory === 'all' || p.category === activeCategory;
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        p.name?.toLowerCase().includes(q) ||
        p.material?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
    // Apply product-type filter (rounded circles)
    if (activeProductType) {
      const selectedType = productTypes.find((t) => t.key === activeProductType);
      if (selectedType) {
        const keywords = selectedType.keywords
          ? selectedType.keywords.split(',').map((k) => k.trim().toLowerCase())
          : [selectedType.key.toLowerCase(), selectedType.label.toLowerCase()];
        result = result.filter((p) =>
          keywords.some((kw) => p.name?.toLowerCase().includes(kw))
        );
      }
    }
    return result;
  }, [products, activeCategory, searchQuery, activeProductType, productTypes]);

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
              <span className="inline-flex items-center gap-1.5 text-xs bg-yellow-50 text-yellow-700 font-bold px-3 py-1.5 rounded-full uppercase tracking-wider border border-yellow-200">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                Handpicked Exclusives
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
          <p className="text-wood-600 max-w-xl mx-auto mb-6">
            Every design is crafted with the finest wood and skilled craftsmanship.
            Choose your perfect furniture.
          </p>

          {/* ✨ Eye-Catching Download Button */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href="/print-catalog"
              target="_blank"
              rel="noopener noreferrer"
              className="relative inline-flex items-center gap-3 px-7 py-3.5 rounded-2xl font-bold text-sm text-white overflow-hidden group transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
              style={{ background: 'linear-gradient(135deg, #92400e 0%, #b45309 50%, #d97706 100%)' }}
            >
              {/* Animated glow ring */}
              <span className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ boxShadow: '0 0 30px rgba(180, 83, 9, 0.6)' }} />
              {/* Shimmer sweep */}
              <span className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              <svg className="w-5 h-5 relative z-10 group-hover:animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span className="relative z-10 tracking-wide">📥 Download Full Catalog (PDF)</span>
            </a>

            {/* Category-wise download — shown when a category is active */}
            {activeCategory !== 'all' && (
              <a
                href={`/print-catalog?category=${activeCategory}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl font-semibold text-sm border-2 border-wood-400 text-wood-700 bg-wood-50 hover:bg-wood-100 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download {categories.find(c => c.slug === activeCategory)?.name || activeCategory} Catalog
              </a>
            )}
          </div>
        </div>

        {/* 🔍 Search Bar */}
        <div className="mb-6">
          <SearchBar value={searchQuery} onChange={handleSearchChange} />
        </div>

        {/* 🔵 Quick Browse — Floating Circles (no box) */}
        <div className="mb-6">
          <ProductTypeFilter
            productTypes={productTypes}
            activeType={activeProductType}
            onTypeChange={handleProductTypeChange}
          />
          {/* Active type chip — tap to clear */}
          {activeProductType && (
            <div className="flex justify-center mt-4">
              <button
                onClick={() => handleProductTypeChange('')}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-wood-600 dark:text-wood-400
                  bg-wood-100/80 dark:bg-charcoal-800 hover:bg-wood-200 dark:hover:bg-charcoal-800
                  px-4 py-1.5 rounded-full border border-wood-200 dark:border-wood-800 transition-colors"
              >
                ✕ Clear
              </button>
            </div>
          )}
        </div>

        {/* 🏷️ Admin Categories — Square Pills (Living Room, Bedroom, Dining...) */}
        <div className="mb-8">
          <CategoryFilter
            categories={categories}
            activeCategory={activeCategory}
            onCategoryChange={handleCategoryChange}
          />
        </div>

        {/* 🆕 Recently Added — right below category filter */}
        {showRecentSection && (
          <div className="mb-10 animate-fade-in">
            <div className="flex items-center gap-3 mb-5">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-wood-100 flex items-center justify-center">
                  <svg className="w-4 h-4 text-wood-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="font-playfair font-bold text-lg text-charcoal-900">Recently Added</h3>
              </div>
              <div className="flex-1 h-px bg-wood-100" />
              <span className="text-[10px] bg-wood-100 text-wood-600 font-semibold px-2.5 py-1 rounded-full uppercase tracking-wide">
                New Arrivals
              </span>
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

            <div className="w-full h-px bg-wood-100 mt-10" />
          </div>
        )}

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

        {/* Recently Added section moved above the product grid */}
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
