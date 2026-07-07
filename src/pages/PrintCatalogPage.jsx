import { useEffect, useMemo } from 'react';
import useProducts from '../hooks/useProducts';
import useCategories from '../hooks/useCategories';

const PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80';

const PrintCatalogPage = () => {
  const { products, loading: productsLoading } = useProducts();
  const { categories, loading: catsLoading } = useCategories();

  // Read category filter from URL params e.g. /print-catalog?category=bedroom
  const categorySlug = new URLSearchParams(window.location.search).get('category') || '';
  const categoryInfo = categories.find(c => c.slug === categorySlug);

  const filteredProducts = useMemo(() => {
    if (!categorySlug) return products;
    return products.filter(p => p.category === categorySlug);
  }, [products, categorySlug]);

  const loading = productsLoading || catsLoading;

  // Add print-catalog-body class so @media print rules apply correctly
  useEffect(() => {
    document.body.classList.add('print-catalog-body');
    return () => {
      document.body.classList.remove('print-catalog-body');
    };
  }, []);

  const handlePrint = () => window.print();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white text-stone-700">
        <div className="w-10 h-10 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin mb-4" />
        <p className="font-semibold text-sm text-stone-600">Loading catalog data…</p>
      </div>
    );
  }

  const catalogTitle = categoryInfo
    ? `${categoryInfo.emoji || '📦'} ${categoryInfo.name} Catalog`
    : 'Complete Product Catalog';

  return (
    <div className="bg-gray-100 min-h-screen">

      {/* ── Sticky action bar (screen only, hidden when printing) ── */}
      <div className="no-print-btn sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xl">🪵</span>
          <div>
            <p className="font-bold text-sm text-gray-800">Sagar Furniture — {catalogTitle}</p>
            <p className="text-xs text-gray-500">{filteredProducts.length} products ready to print</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {categorySlug && (
            <a
              href="/print-catalog"
              className="text-xs text-amber-700 hover:text-amber-900 font-medium px-3 py-1.5 border border-amber-200 bg-amber-50 rounded-lg transition-colors"
            >
              📋 Full Catalog
            </a>
          )}
          <button
            onClick={() => window.close()}
            className="text-xs text-gray-500 hover:text-gray-700 px-3 py-1.5 border border-gray-200 rounded-lg transition-colors"
          >
            ✕ Close
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 text-white font-semibold px-5 py-2 rounded-xl text-sm transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
            style={{ background: 'linear-gradient(135deg, #92400e 0%, #b45309 60%, #d97706 100%)' }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Print / Save as PDF
          </button>
        </div>
      </div>

      {/* ── Catalog Document ── */}
      <div
        className="bg-white mx-auto my-6 shadow-xl print-catalog-view"
        style={{ maxWidth: '210mm', minHeight: '297mm', padding: '16mm' }}
      >
        {/* Header */}
        <div style={{ borderBottom: '3px solid #92400e', paddingBottom: '12px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '26px', fontWeight: 'bold', color: '#78350f', lineHeight: 1.2, margin: 0 }}>
              SAGAR FURNITURE
            </h1>
            <p style={{ fontSize: '10px', letterSpacing: '0.12em', color: '#78716c', textTransform: 'uppercase', fontWeight: '600', margin: '4px 0 0 0' }}>
              Premium Handcrafted Wooden Furniture
            </p>
          </div>
          <div style={{ textAlign: 'right', fontSize: '11px', color: '#92400e', lineHeight: 1.8 }}>
            <p>📞 +91 84768 15120</p>
            <p>📍 Sagar Furniture Showroom</p>
          </div>
        </div>

        {/* Catalog Title / Sub-heading */}
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '16px', fontWeight: 'bold', color: '#1c1917', letterSpacing: '0.05em', textTransform: 'uppercase', margin: 0 }}>
            {catalogTitle}
          </h2>
          {categoryInfo && (
            <p style={{ fontSize: '11px', color: '#78716c', marginTop: '4px' }}>
              Showing {filteredProducts.length} designs in this category
            </p>
          )}
          <div style={{ width: '60px', height: '2px', background: '#92400e', margin: '6px auto 0' }} />
        </div>

        {/* Empty State */}
        {filteredProducts.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#a8a29e' }}>
            <p style={{ fontSize: '40px', margin: 0 }}>📭</p>
            <p style={{ fontSize: '14px', marginTop: '12px' }}>No products found in this category.</p>
          </div>
        )}

        {/* Product Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          {filteredProducts.map((product) => {
            const mainImage = product.imageUrls?.[0] || product.imageUrl || PLACEHOLDER_IMAGE;
            return (
              <div
                key={product.id}
                style={{
                  border: '1px solid #e7e5e4',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  background: '#fff',
                  pageBreakInside: 'avoid',
                  breakInside: 'avoid',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                {/* Product Image */}
                <div style={{ height: '160px', overflow: 'hidden', background: '#fafaf9' }}>
                  <img
                    src={mainImage}
                    alt={product.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    onError={(e) => { e.target.src = PLACEHOLDER_IMAGE; }}
                  />
                </div>
                {/* Product Info */}
                <div style={{ padding: '10px 12px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <h3 style={{ fontSize: '13px', fontWeight: 'bold', color: '#1c1917', margin: '0 0 4px 0', lineHeight: 1.3 }}>
                      {product.name}
                    </h3>
                    {product.material && (
                      <p style={{ fontSize: '10px', color: '#78716c', margin: '2px 0' }}>🪵 {product.material}</p>
                    )}
                    {product.dimensions && (
                      <p style={{ fontSize: '10px', color: '#a8a29e', margin: '2px 0' }}>📐 {product.dimensions}</p>
                    )}
                    {product.warranty && (
                      <p style={{ fontSize: '10px', color: '#a8a29e', margin: '2px 0' }}>🛡️ {product.warranty}</p>
                    )}
                  </div>
                  <div style={{ borderTop: '1px solid #f5f5f4', marginTop: '8px', paddingTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '9px', textTransform: 'uppercase', fontWeight: '700', color: '#a8a29e', letterSpacing: '0.08em' }}>
                      {categoryInfo?.name || product.category}
                    </span>
                    {product.price && (
                      <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#78350f' }}>
                        ₹ {product.price}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div style={{ borderTop: '1px solid #e7e5e4', marginTop: '32px', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: '#a8a29e' }}>
          <span>© Sagar Furniture. All Rights Reserved.</span>
          <span>For custom orders &amp; enquiries, contact us on WhatsApp</span>
        </div>
      </div>
    </div>
  );
};

export default PrintCatalogPage;
