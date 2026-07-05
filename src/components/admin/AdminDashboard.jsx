import { useState, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { addProduct, updateProduct, deleteProduct, toggleFeatured, bulkAddProducts } from '../../services/productService';
import { addCategory, updateCategory, deleteCategory, seedDefaultCategories } from '../../services/categoryService';
import { addBanner, updateBanner, deleteBanner, toggleBannerActive } from '../../services/bannerService';

const ADMIN_PAGE_SIZE = 20;

// Smart dropdown presets
const MATERIAL_OPTIONS = [
  'Solid Sheesham Wood', 'Solid Teak Wood', 'Solid Mango Wood',
  'Solid Acacia Wood', 'Pine Wood', 'Oak Wood', 'Walnut Wood',
  'MDF Board', 'Plywood', 'Bamboo',
];
const FINISH_OPTIONS = [
  'Walnut', 'Honey', 'Natural', 'Mahogany', 'Dark Walnut',
  'White', 'Ivory', 'Antique', 'Matte Black', 'Wenge',
];
const DIMENSION_OPTIONS = [
  '3x6 ft', '3.5x6 ft', '4x6 ft', '5x6 ft', '6x6 ft', '6x6.5 ft',
  '6x7 ft', '4x2 ft', '5x2.5 ft', '6x3 ft',
];
const WARRANTY_OPTIONS = [
  '6 Month Warranty', '1 Year Warranty', '2 Year Warranty',
  '3 Year Warranty', '5 Year Warranty', 'Lifetime Warranty', 'No Warranty',
];

const EMPTY_FORM = {
  name: '', category: 'living', price: '',
  material: '', dimensions: '', finish: '',
  warranty: '', description: '',
};

const EMOJI_LIST = ['🛋️','🛏️','🍽️','💼','🪑','🚿','🧸','🏡','🌿','📦','🎨','🔨','🏺','🪵','🧹'];

// =============================================
// ComboField — Dropdown preset + manual typing
// =============================================
const ComboField = ({ label, value, onChange, options, placeholder }) => {
  const [mode, setMode] = useState('select');
  return (
    <div>
      <label className="block text-wood-700 text-sm font-medium mb-1">{label}</label>
      <div className="flex gap-2">
        {mode === 'select' ? (
          <>
            <select value={options.includes(value) ? value : ''}
              onChange={(e) => { if (e.target.value === '__custom__') { setMode('manual'); onChange(''); } else { onChange(e.target.value); } }}
              className="flex-1 px-4 py-2.5 border-2 border-wood-200 rounded-xl focus:outline-none focus:border-wood-500 transition-all bg-white text-sm">
              <option value="">— Select —</option>
              {options.map((o) => <option key={o} value={o}>{o}</option>)}
              <option value="__custom__">✏️ Type manually...</option>
            </select>
          </>
        ) : (
          <>
            <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} autoFocus
              className="flex-1 px-4 py-2.5 border-2 border-wood-400 rounded-xl focus:outline-none focus:border-wood-600 transition-all text-sm" />
            <button type="button" onClick={() => setMode('select')}
              className="px-3 py-1 text-xs bg-wood-100 text-wood-700 rounded-xl hover:bg-wood-200 transition-colors whitespace-nowrap">
              ← Presets
            </button>
          </>
        )}
      </div>
    </div>
  );
};

// =============================================
// STAT CARD (Clickable)
// =============================================
const StatCard = ({ icon, label, value, color = 'wood', onClick }) => (
  <button onClick={onClick} className="w-full text-left bg-white rounded-2xl shadow-card p-5 flex items-center gap-4 hover:scale-105 hover:shadow-lg transition-all focus:outline-none border-2 border-transparent hover:border-wood-200">
    <div className={`w-14 h-14 rounded-xl bg-${color}-100 flex items-center justify-center text-2xl flex-shrink-0`}>
      {icon}
    </div>
    <div>
      <p className="text-wood-500 text-[10px] uppercase tracking-wider font-semibold">{label}</p>
      <p className="font-playfair text-xl md:text-2xl font-bold text-charcoal-900">{value}</p>
    </div>
  </button>
);

// =============================================
// MAIN ADMIN DASHBOARD
// =============================================
const AdminDashboard = ({ products, categories, banners, visitsStats = { totalVisits: 0, uniqueVisitors: 0, visits: [] }, onLogout, userEmail }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [toast, setToast] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Category state
  const [catForm, setCatForm] = useState({ name: '', emoji: '📦' });
  const [editingCat, setEditingCat] = useState(null);
  const [deleteCatConfirm, setDeleteCatConfirm] = useState(null);

  // Banner state
  const [bannerForm, setBannerForm] = useState({ title: '', subtitle: '', linkUrl: '', order: 1 });
  const [editingBanner, setEditingBanner] = useState(null);
  const [bannerImageFile, setBannerImageFile] = useState(null);
  const [bannerImagePreview, setBannerImagePreview] = useState('');
  const [deleteBannerConfirm, setDeleteBannerConfirm] = useState(null);

  // Bulk upload state
  const [excelData, setExcelData] = useState([]);
  const [excelFileName, setExcelFileName] = useState('');
  const [bulkUploading, setBulkUploading] = useState(false);
  const [bulkResult, setBulkResult] = useState(null);

  // Filtering & traffic details modal states
  const [filterFeaturedOnly, setFilterFeaturedOnly] = useState(false);
  const [showTrafficModal, setShowTrafficModal] = useState(false);

  const totalViews = useMemo(() => products.reduce((sum, p) => sum + (p.viewCount || 0), 0), [products]);

  const filteredProducts = useMemo(() => {
    return filterFeaturedOnly ? products.filter(p => p.featured) : products;
  }, [products, filterFeaturedOnly]);

  const totalPages = Math.ceil(filteredProducts.length / ADMIN_PAGE_SIZE);

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * ADMIN_PAGE_SIZE;
    return filteredProducts.slice(start, start + ADMIN_PAGE_SIZE);
  }, [filteredProducts, currentPage]);

  const categoryStats = useMemo(() => {
    const stats = {};
    products.forEach((p) => {
      stats[p.category] = (stats[p.category] || 0) + 1;
    });
    return stats;
  }, [products]);

  const topViewed = useMemo(() =>
    [...products].sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0)).slice(0, 5),
    [products]
  );

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  // ---- Product handlers ----
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) { setImageFile(file); setImagePreview(URL.createObjectURL(file)); }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setForm({
      name: product.name || '', category: product.category || 'living',
      price: product.price || '', material: product.material || '',
      dimensions: product.dimensions || '', finish: product.finish || '',
      warranty: product.warranty || '', description: product.description || '',
    });
    setImagePreview(product.imageUrl || '');
    setImageFile(null);
    setShowForm(true);
    setActiveTab('products');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, form, imageFile);
        showToast('✅ Product updated successfully!');
      } else {
        await addProduct(form, imageFile);
        showToast('✅ New product added!');
      }
      setForm(EMPTY_FORM); setImageFile(null); setImagePreview('');
      setEditingProduct(null); setShowForm(false);
    } catch (err) { showToast('❌ Error: ' + err.message); }
    finally { setLoading(false); }
  };

  const handleDelete = async (product) => {
    setLoading(true);
    try {
      await deleteProduct(product.id);
      showToast('🗑️ Product deleted.');
      setDeleteConfirm(null);
      if (paginatedProducts.length === 1 && currentPage > 1) setCurrentPage(currentPage - 1);
    } catch (err) { showToast('❌ Error: ' + err.message); }
    finally { setLoading(false); }
  };

  const handleToggleFeatured = async (product) => {
    try {
      await toggleFeatured(product.id, product.featured || false);
      showToast(product.featured ? '⭐ Removed from featured' : '⭐ Marked as featured!');
    } catch (err) { showToast('❌ Error: ' + err.message); }
  };

  // ---- Category handlers ----
  const handleCatSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingCat) {
        await updateCategory(editingCat.id, catForm.name, catForm.emoji);
        showToast('✅ Category updated!');
      } else {
        await addCategory(catForm.name, catForm.emoji);
        showToast('✅ Category added!');
      }
      setCatForm({ name: '', emoji: '📦' }); setEditingCat(null);
    } catch (err) { showToast('❌ Error: ' + err.message); }
    finally { setLoading(false); }
  };

  const handleDeleteCat = async (cat) => {
    setLoading(true);
    try {
      await deleteCategory(cat.id);
      showToast('🗑️ Category deleted.');
      setDeleteCatConfirm(null);
    } catch (err) { showToast('❌ Error: ' + err.message); }
    finally { setLoading(false); }
  };

  const handleSeedCategories = async () => {
    setLoading(true);
    try {
      await seedDefaultCategories();
      showToast('✅ Default categories added!');
    } catch (err) { showToast('❌ Error: ' + err.message); }
    finally { setLoading(false); }
  };

  // ---- Banner handlers ----
  const handleBannerImageChange = (e) => {
    const file = e.target.files[0];
    if (file) { setBannerImageFile(file); setBannerImagePreview(URL.createObjectURL(file)); }
  };

  const handleBannerSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingBanner) {
        await updateBanner(editingBanner.id, bannerForm, bannerImageFile);
        showToast('✅ Banner updated!');
      } else {
        await addBanner(bannerForm, bannerImageFile);
        showToast('✅ Banner added!');
      }
      setBannerForm({ title: '', subtitle: '', linkUrl: '', order: 1 });
      setBannerImageFile(null); setBannerImagePreview(''); setEditingBanner(null);
    } catch (err) { showToast('❌ Error: ' + err.message); }
    finally { setLoading(false); }
  };

  const handleDeleteBanner = async (banner) => {
    setLoading(true);
    try {
      await deleteBanner(banner.id);
      showToast('🗑️ Banner deleted.');
      setDeleteBannerConfirm(null);
    } catch (err) { showToast('❌ Error: ' + err.message); }
    finally { setLoading(false); }
  };

  // ---- Bulk Upload handlers ----
  const handleExcelUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setExcelFileName(file.name);
    setBulkResult(null);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Read the first worksheet
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        if (jsonData.length < 2) {
          showToast('❌ Excel sheet must have header + at least 1 row of data');
          return;
        }

        const headers = jsonData[0].map(h => String(h).trim().toLowerCase());
        const rows = [];

        for (let i = 1; i < jsonData.length; i++) {
          const vals = jsonData[i];
          if (!vals || vals.length === 0) continue;
          
          const row = {};
          headers.forEach((h, idx) => {
            row[h] = vals[idx] !== undefined ? String(vals[idx]).trim() : '';
          });
          
          if (row.name) {
            rows.push(row);
          }
        }

        setExcelData(rows);
      } catch (err) {
        showToast('❌ Error parsing Excel: ' + err.message);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleBulkImport = async () => {
    if (excelData.length === 0) return;
    setBulkUploading(true);
    try {
      const result = await bulkAddProducts(excelData);
      setBulkResult(result);
      showToast(`✅ ${result.success} products imported from Excel!`);
      setExcelData([]);
      setExcelFileName('');
    } catch (err) {
      showToast('❌ Error: ' + err.message);
    } finally {
      setBulkUploading(false);
    }
  };

  const getPageNumbers = () => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (currentPage <= 3) return [1, 2, 3, 4, '...', totalPages];
    if (currentPage >= totalPages - 2) return [1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
  };

  const TABS = [
    { id: 'dashboard', label: '📊 Dashboard' },
    { id: 'products', label: '📦 Products' },
    { id: 'categories', label: '📂 Categories' },
    { id: 'banners', label: '🎯 Banners' },
    { id: 'bulk', label: '📤 Bulk Upload' },
  ];

  const getCatLabel = (slug) => {
    const cat = categories.find(c => c.slug === slug);
    return cat ? `${cat.emoji} ${cat.name}` : slug;
  };

  return (
    <div className="min-h-screen bg-wood-50">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-charcoal-900 text-white px-5 py-3 rounded-xl shadow-xl animate-slide-up">
          {toast}
        </div>
      )}

      {/* Header */}
      <header className="bg-dark-gradient bg-charcoal-950 text-white px-4 py-4 shadow-xl sticky top-0 z-40">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="font-playfair text-xl font-bold text-wood-300">Sagar Furniture — Admin</h1>
            <p className="text-wood-100/50 text-xs">{userEmail} · {products.length} Products</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => { setEditingProduct(null); setForm(EMPTY_FORM); setImagePreview(''); setImageFile(null); setShowForm(true); setActiveTab('products'); }}
              className="btn-primary text-sm px-4 py-2">+ Add Product</button>
            <button onClick={onLogout} className="text-wood-300/70 hover:text-wood-300 text-sm transition-colors">Logout</button>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-wood-100 sticky top-[72px] z-30 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 flex gap-1 overflow-x-auto">
          {TABS.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition-all border-b-2
                ${activeTab === tab.id
                  ? 'border-wood-600 text-wood-800 bg-wood-50'
                  : 'border-transparent text-wood-400 hover:text-wood-600 hover:border-wood-200'}`}>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* ============================= */}
        {/* TAB: DASHBOARD */}
        {/* ============================= */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8 animate-fade-in">
            {/* Stat Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <StatCard icon="📦" label="Total Products" value={products.length} onClick={() => { setActiveTab('products'); setFilterFeaturedOnly(false); }} />
              <StatCard icon="📂" label="Categories" value={categories.length} onClick={() => setActiveTab('categories')} />
              <StatCard icon="👁️" label="Product Views" value={totalViews.toLocaleString()} onClick={() => document.getElementById('top-viewed-products')?.scrollIntoView({ behavior: 'smooth' })} />
              <StatCard icon="⭐" label="Featured" value={products.filter(p => p.featured).length} onClick={() => { setActiveTab('products'); setFilterFeaturedOnly(true); }} />
              <StatCard icon="📈" label="Total Visits" value={visitsStats.totalVisits.toLocaleString()} color="green" onClick={() => setShowTrafficModal(true)} />
              <StatCard icon="👥" label="Unique Visitors" value={visitsStats.uniqueVisitors.toLocaleString()} color="green" onClick={() => setShowTrafficModal(true)} />
            </div>

            {/* Category Breakdown */}
            <div className="bg-white rounded-2xl shadow-card p-6">
              <h3 className="font-playfair text-lg font-bold text-charcoal-900 mb-4">📂 Category Breakdown</h3>
              <div className="space-y-3">
                {categories.map((cat) => {
                  const count = categoryStats[cat.slug] || 0;
                  const pct = products.length > 0 ? Math.round((count / products.length) * 100) : 0;
                  return (
                    <div key={cat.id} className="flex items-center gap-3">
                      <span className="text-xl w-8">{cat.emoji}</span>
                      <span className="text-sm font-medium text-charcoal-900 w-28">{cat.name}</span>
                      <div className="flex-1 bg-wood-100 rounded-full h-4 overflow-hidden">
                        <div className="h-full bg-wood-gradient rounded-full transition-all duration-500"
                          style={{ width: `${Math.max(pct, 2)}%` }} />
                      </div>
                      <span className="text-sm font-semibold text-wood-700 w-16 text-right">{count} ({pct}%)</span>
                    </div>
                  );
                })}
                {categories.length === 0 && (
                  <p className="text-wood-400 text-sm">No categories yet. Go to Categories tab to add some.</p>
                )}
              </div>
            </div>

            {/* Top Viewed Products */}
            <div id="top-viewed-products" className="bg-white rounded-2xl shadow-card p-6 scroll-mt-24">
              <h3 className="font-playfair text-lg font-bold text-charcoal-900 mb-4">📈 Top Viewed Products</h3>
              {topViewed.length === 0 ? (
                <p className="text-wood-400 text-sm">No views yet. Views will be tracked when customers browse the catalog.</p>
              ) : (
                <div className="space-y-3">
                  {topViewed.map((p, idx) => (
                    <div key={p.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-wood-50 transition-colors">
                      <span className="font-bold text-wood-300 text-lg w-6">{idx + 1}</span>
                      <img src={p.imageUrl || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=80&q=60'}
                        alt={p.name} className="w-12 h-12 rounded-lg object-cover"
                        onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=80&q=60'; }} />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-charcoal-900 text-sm truncate">{p.name}</p>
                        <p className="text-wood-400 text-xs">{getCatLabel(p.category)}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-wood-700 text-sm">{(p.viewCount || 0).toLocaleString()}</p>
                        <p className="text-wood-400 text-xs">views</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ============================= */}
        {/* TAB: PRODUCTS */}
        {/* ============================= */}
        {activeTab === 'products' && (
          <div className="animate-fade-in">
            {/* Add/Edit Form */}
            {showForm && (
              <div className="bg-white rounded-2xl shadow-card p-6 mb-8 animate-slide-up">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-playfair text-xl font-bold text-charcoal-900">
                    {editingProduct ? '✏️ Edit Product' : '➕ Add New Product'}
                  </h2>
                  <button onClick={() => setShowForm(false)} className="text-wood-400 hover:text-wood-700 transition-colors">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-wood-700 text-sm font-medium mb-1">Product Name *</label>
                      <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder="e.g. Royal Teak Double Bed"
                        className="w-full px-4 py-2.5 border-2 border-wood-200 rounded-xl focus:outline-none focus:border-wood-500 transition-all text-sm" />
                    </div>
                    <div>
                      <label className="block text-wood-700 text-sm font-medium mb-1">Category *</label>
                      <select required value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                        className="w-full px-4 py-2.5 border-2 border-wood-200 rounded-xl focus:outline-none focus:border-wood-500 transition-all bg-white text-sm">
                        {categories.length > 0 ? categories.map((c) => (
                          <option key={c.id} value={c.slug}>{c.emoji} {c.name}</option>
                        )) : (
                          <>
                            <option value="living">🛋️ Living Room</option>
                            <option value="bedroom">🛏️ Bedroom</option>
                            <option value="dining">🍽️ Dining Room</option>
                            <option value="office">💼 Office</option>
                          </>
                        )}
                      </select>
                    </div>
                    <div>
                      <label className="block text-wood-700 text-sm font-medium mb-1">Price Range</label>
                      <input value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })}
                        placeholder="e.g. ₹25,000 - ₹45,000"
                        className="w-full px-4 py-2.5 border-2 border-wood-200 rounded-xl focus:outline-none focus:border-wood-500 transition-all text-sm" />
                    </div>
                    <ComboField label="Material / Wood Type" value={form.material}
                      onChange={(v) => setForm({ ...form, material: v })} options={MATERIAL_OPTIONS} placeholder="e.g. Solid Sheesham Wood" />
                    <ComboField label="Dimensions / Size" value={form.dimensions}
                      onChange={(v) => setForm({ ...form, dimensions: v })} options={DIMENSION_OPTIONS} placeholder="e.g. 6x6 ft | Height: 42 inch" />
                    <ComboField label="Polish / Finish" value={form.finish}
                      onChange={(v) => setForm({ ...form, finish: v })} options={FINISH_OPTIONS} placeholder="e.g. Walnut / Honey / Natural" />
                    <ComboField label="Warranty" value={form.warranty}
                      onChange={(v) => setForm({ ...form, warranty: v })} options={WARRANTY_OPTIONS} placeholder="e.g. 2 Year Warranty" />
                  </div>
                  <div>
                    <label className="block text-wood-700 text-sm font-medium mb-1">Description</label>
                    <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                      rows={3} placeholder="Describe the furniture..."
                      className="w-full px-4 py-2.5 border-2 border-wood-200 rounded-xl focus:outline-none focus:border-wood-500 transition-all resize-none text-sm" />
                  </div>
                  <div>
                    <label className="block text-wood-700 text-sm font-medium mb-2">
                      Upload Photo <span className="ml-2 text-xs text-wood-400 font-normal">(Cloudinary — Free Storage)</span>
                    </label>
                    <div className="flex items-start gap-4">
                      <label className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-wood-300 rounded-xl p-6 cursor-pointer hover:border-wood-500 hover:bg-wood-50 transition-all">
                        <svg className="w-8 h-8 text-wood-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="text-wood-500 text-sm text-center">
                          {imageFile ? `✅ ${imageFile.name}` : 'Choose photo or take from Camera'}
                        </span>
                        <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                      </label>
                      {imagePreview && (
                        <img src={imagePreview} alt="preview" className="w-24 h-24 object-cover rounded-xl border-2 border-wood-200" />
                      )}
                    </div>
                  </div>
                  <div className="flex gap-3 pt-1">
                    <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2 disabled:opacity-70">
                      {loading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</> : '💾 Save Product'}
                    </button>
                    <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
                  </div>
                </form>
              </div>
            )}

            {/* Products List Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-3">
                <h2 className="font-playfair text-xl font-bold text-charcoal-900">
                  {filterFeaturedOnly ? '⭐ Featured Products' : 'All Products'} ({filteredProducts.length})
                </h2>
                {filterFeaturedOnly && (
                  <button 
                    onClick={() => setFilterFeaturedOnly(false)}
                    className="text-xs bg-red-50 text-red-600 hover:bg-red-100 px-2 py-1 rounded-lg font-medium transition-colors"
                  >
                    Clear Filter ✕
                  </button>
                )}
              </div>
              {totalPages > 1 && <p className="text-wood-500 text-sm">Page {currentPage} of {totalPages}</p>}
            </div>

            {products.length === 0 && (
              <div className="text-center py-16 bg-white rounded-2xl shadow-card">
                <div className="text-5xl mb-3">🪑</div>
                <p className="text-wood-500">No products yet. Click "+ Add Product" to get started.</p>
              </div>
            )}

            <div className="space-y-4">
              {paginatedProducts.map((product) => (
                <div key={product.id} className="card flex flex-col sm:flex-row gap-4 p-4 hover:translate-y-0">
                  <img src={product.imageUrl || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=200&q=80'}
                    alt={product.name} className="w-full sm:w-28 h-28 object-cover rounded-xl flex-shrink-0"
                    onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=200&q=80'; }} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-charcoal-900 truncate">{product.name}</h3>
                      {product.featured && <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-lg font-medium">⭐ Featured</span>}
                    </div>
                    <p className="text-wood-500 text-sm">{product.material}{product.dimensions ? ` | ${product.dimensions}` : ''}</p>
                    {product.price && <p className="text-wood-700 font-medium text-sm">₹ {product.price}</p>}
                    {product.warranty && <p className="text-wood-400 text-xs mt-0.5">🛡️ {product.warranty}</p>}
                    <div className="flex items-center gap-2 mt-2">
                      <span className="badge bg-wood-100 text-wood-700">{getCatLabel(product.category)}</span>
                      <span className="text-wood-300 text-xs">👁️ {(product.viewCount || 0).toLocaleString()} views</span>
                    </div>
                  </div>
                  <div className="flex sm:flex-col gap-2 justify-end flex-shrink-0">
                    <button onClick={() => handleToggleFeatured(product)}
                      className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors ${product.featured ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' : 'bg-gray-50 text-gray-500 hover:bg-yellow-50 hover:text-yellow-600'}`}>
                      {product.featured ? '⭐ Featured' : '☆ Feature'}
                    </button>
                    <button onClick={() => handleEdit(product)}
                      className="px-3 py-2 bg-wood-100 text-wood-700 rounded-xl text-sm font-medium hover:bg-wood-200 transition-colors">
                      ✏️ Edit
                    </button>
                    <button onClick={() => setDeleteConfirm(product)}
                      className="px-3 py-2 bg-red-50 text-red-600 rounded-xl text-sm font-medium hover:bg-red-100 transition-colors">
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-10 flex flex-col items-center gap-3">
                <div className="flex items-center gap-2 flex-wrap justify-center">
                  <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
                    className="px-4 py-2 rounded-xl border-2 border-wood-200 bg-white text-wood-700 font-medium text-sm hover:border-wood-500 transition-all disabled:opacity-40 disabled:cursor-not-allowed">← Prev</button>
                  {getPageNumbers().map((page, idx) =>
                    page === '...' ? <span key={`e-${idx}`} className="px-2 text-wood-400 text-sm">...</span> : (
                      <button key={page} onClick={() => setCurrentPage(page)}
                        className={`w-10 h-10 rounded-xl font-semibold text-sm transition-all duration-200
                          ${currentPage === page ? 'bg-wood-gradient text-white shadow-wood border-2 border-wood-600 scale-110' : 'border-2 border-wood-200 bg-white text-wood-700 hover:border-wood-400 hover:scale-105'}`}>
                        {page}
                      </button>
                    )
                  )}
                  <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                    className="px-4 py-2 rounded-xl border-2 border-wood-200 bg-white text-wood-700 font-medium text-sm hover:border-wood-500 transition-all disabled:opacity-40 disabled:cursor-not-allowed">Next →</button>
                </div>
                <p className="text-wood-400 text-xs">
                  Showing {((currentPage - 1) * ADMIN_PAGE_SIZE) + 1}–{Math.min(currentPage * ADMIN_PAGE_SIZE, products.length)} of {products.length} products
                </p>
              </div>
            )}
          </div>
        )}

        {/* ============================= */}
        {/* TAB: CATEGORIES */}
        {/* ============================= */}
        {activeTab === 'categories' && (
          <div className="animate-fade-in space-y-6">
            {/* Add/Edit Category */}
            <div className="bg-white rounded-2xl shadow-card p-6">
              <h3 className="font-playfair text-lg font-bold text-charcoal-900 mb-4">
                {editingCat ? '✏️ Edit Category' : '➕ Add New Category'}
              </h3>
              <form onSubmit={handleCatSubmit} className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <input required value={catForm.name} onChange={(e) => setCatForm({ ...catForm, name: e.target.value })}
                    placeholder="Category name (e.g. Kitchen)" className="w-full px-4 py-2.5 border-2 border-wood-200 rounded-xl focus:outline-none focus:border-wood-500 transition-all text-sm" />
                </div>
                <div>
                  <div className="flex gap-1 flex-wrap max-w-xs">
                    {EMOJI_LIST.map((em) => (
                      <button key={em} type="button" onClick={() => setCatForm({ ...catForm, emoji: em })}
                        className={`w-9 h-9 rounded-lg text-lg flex items-center justify-center transition-all
                          ${catForm.emoji === em ? 'bg-wood-200 ring-2 ring-wood-500 scale-110' : 'hover:bg-wood-50'}`}>
                        {em}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button type="submit" disabled={loading} className="btn-primary text-sm px-4 py-2 disabled:opacity-70">
                    {loading ? 'Saving...' : editingCat ? 'Update' : '+ Add'}
                  </button>
                  {editingCat && (
                    <button type="button" onClick={() => { setEditingCat(null); setCatForm({ name: '', emoji: '📦' }); }}
                      className="btn-secondary text-sm px-4 py-2">Cancel</button>
                  )}
                </div>
              </form>
            </div>

            {/* Category List */}
            <div className="bg-white rounded-2xl shadow-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-playfair text-lg font-bold text-charcoal-900">All Categories ({categories.length})</h3>
                {categories.length === 0 && (
                  <button onClick={handleSeedCategories} disabled={loading}
                    className="btn-secondary text-sm px-4 py-2">🌱 Seed Defaults</button>
                )}
              </div>
              {categories.length === 0 ? (
                <p className="text-wood-400 text-sm text-center py-8">No categories. Add one above or click "Seed Defaults" to add Living Room, Bedroom, Dining Room, Office.</p>
              ) : (
                <div className="space-y-3">
                  {categories.map((cat) => (
                    <div key={cat.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-wood-50 transition-colors border border-wood-100">
                      <span className="text-2xl">{cat.emoji}</span>
                      <div className="flex-1">
                        <p className="font-medium text-charcoal-900">{cat.name}</p>
                        <p className="text-wood-400 text-xs">Slug: {cat.slug} · {categoryStats[cat.slug] || 0} products</p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => { setEditingCat(cat); setCatForm({ name: cat.name, emoji: cat.emoji }); }}
                          className="px-3 py-1.5 bg-wood-100 text-wood-700 rounded-lg text-sm hover:bg-wood-200 transition-colors">✏️</button>
                        <button onClick={() => setDeleteCatConfirm(cat)}
                          className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-sm hover:bg-red-100 transition-colors">🗑️</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ============================= */}
        {/* TAB: BANNERS */}
        {/* ============================= */}
        {activeTab === 'banners' && (
          <div className="animate-fade-in space-y-6">
            {/* Add/Edit Banner */}
            <div className="bg-white rounded-2xl shadow-card p-6">
              <h3 className="font-playfair text-lg font-bold text-charcoal-900 mb-4">
                {editingBanner ? '✏️ Edit Banner' : '🎯 Add New Banner'}
              </h3>
              <form onSubmit={handleBannerSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-wood-700 text-sm font-medium mb-1">Title</label>
                    <input value={bannerForm.title} onChange={(e) => setBannerForm({ ...bannerForm, title: e.target.value })}
                      placeholder="e.g. Monsoon Sale — 20% Off" className="w-full px-4 py-2.5 border-2 border-wood-200 rounded-xl focus:outline-none focus:border-wood-500 text-sm" />
                  </div>
                  <div>
                    <label className="block text-wood-700 text-sm font-medium mb-1">Subtitle</label>
                    <input value={bannerForm.subtitle} onChange={(e) => setBannerForm({ ...bannerForm, subtitle: e.target.value })}
                      placeholder="e.g. Explore our handcrafted collection" className="w-full px-4 py-2.5 border-2 border-wood-200 rounded-xl focus:outline-none focus:border-wood-500 text-sm" />
                  </div>
                  <div>
                    <label className="block text-wood-700 text-sm font-medium mb-1">Link URL (optional)</label>
                    <input value={bannerForm.linkUrl} onChange={(e) => setBannerForm({ ...bannerForm, linkUrl: e.target.value })}
                      placeholder="e.g. https://wa.me/..." className="w-full px-4 py-2.5 border-2 border-wood-200 rounded-xl focus:outline-none focus:border-wood-500 text-sm" />
                  </div>
                  <div>
                    <label className="block text-wood-700 text-sm font-medium mb-1">Display Order</label>
                    <input type="number" value={bannerForm.order} onChange={(e) => setBannerForm({ ...bannerForm, order: parseInt(e.target.value) || 1 })}
                      className="w-full px-4 py-2.5 border-2 border-wood-200 rounded-xl focus:outline-none focus:border-wood-500 text-sm" />
                  </div>
                </div>
                <div>
                  <label className="block text-wood-700 text-sm font-medium mb-2">Banner Image</label>
                  <div className="flex items-start gap-4">
                    <label className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-wood-300 rounded-xl p-6 cursor-pointer hover:border-wood-500 transition-all">
                      <span className="text-3xl mb-2">🖼️</span>
                      <span className="text-wood-500 text-sm">{bannerImageFile ? `✅ ${bannerImageFile.name}` : 'Choose banner image (1200×400 recommended)'}</span>
                      <input type="file" accept="image/*" onChange={handleBannerImageChange} className="hidden" />
                    </label>
                    {bannerImagePreview && (
                      <img src={bannerImagePreview} alt="preview" className="w-40 h-20 object-cover rounded-xl border-2 border-wood-200" />
                    )}
                  </div>
                </div>
                <div className="flex gap-3">
                  <button type="submit" disabled={loading} className="btn-primary text-sm px-4 py-2 disabled:opacity-70">
                    {loading ? 'Saving...' : editingBanner ? 'Update Banner' : '+ Add Banner'}
                  </button>
                  {editingBanner && (
                    <button type="button" onClick={() => { setEditingBanner(null); setBannerForm({ title: '', subtitle: '', linkUrl: '', order: 1 }); setBannerImagePreview(''); setBannerImageFile(null); }}
                      className="btn-secondary text-sm px-4 py-2">Cancel</button>
                  )}
                </div>
              </form>
            </div>

            {/* Banner List */}
            <div className="bg-white rounded-2xl shadow-card p-6">
              <h3 className="font-playfair text-lg font-bold text-charcoal-900 mb-4">All Banners ({banners.length})</h3>
              {banners.length === 0 ? (
                <p className="text-wood-400 text-sm text-center py-8">No banners yet. Add one above to display on the homepage.</p>
              ) : (
                <div className="space-y-4">
                  {banners.map((banner) => (
                    <div key={banner.id} className={`flex flex-col sm:flex-row gap-4 p-4 rounded-xl border transition-all
                      ${banner.active ? 'border-green-200 bg-green-50/30' : 'border-wood-100 bg-white opacity-60'}`}>
                      {banner.imageUrl && (
                        <img src={banner.imageUrl} alt={banner.title} className="w-full sm:w-40 h-20 object-cover rounded-lg" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-charcoal-900 truncate">{banner.title || 'Untitled Banner'}</h4>
                          <span className={`text-xs px-2 py-0.5 rounded-lg ${banner.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                            {banner.active ? '✅ Active' : '⏸️ Inactive'}
                          </span>
                        </div>
                        {banner.subtitle && <p className="text-wood-500 text-sm">{banner.subtitle}</p>}
                        <p className="text-wood-300 text-xs mt-1">Order: {banner.order}</p>
                      </div>
                      <div className="flex sm:flex-col gap-2">
                        <button onClick={() => toggleBannerActive(banner.id, banner.active)}
                          className="px-3 py-1.5 bg-wood-100 text-wood-700 rounded-lg text-sm hover:bg-wood-200 transition-colors">
                          {banner.active ? '⏸️ Disable' : '✅ Enable'}
                        </button>
                        <button onClick={() => {
                          setEditingBanner(banner);
                          setBannerForm({ title: banner.title || '', subtitle: banner.subtitle || '', linkUrl: banner.linkUrl || '', order: banner.order || 1 });
                          setBannerImagePreview(banner.imageUrl || '');
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }} className="px-3 py-1.5 bg-wood-100 text-wood-700 rounded-lg text-sm hover:bg-wood-200 transition-colors">✏️</button>
                        <button onClick={() => setDeleteBannerConfirm(banner)}
                          className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-sm hover:bg-red-100 transition-colors">🗑️</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ============================= */}
        {/* TAB: BULK UPLOAD */}
        {/* ============================= */}
        {activeTab === 'bulk' && (
          <div className="animate-fade-in space-y-6">
            <div className="bg-white rounded-2xl shadow-card p-6">
              <h3 className="font-playfair text-lg font-bold text-charcoal-900 mb-2">📤 Bulk Upload Products (Excel)</h3>
              <p className="text-wood-500 text-sm mb-6">Upload an Excel spreadsheet to add multiple products at once. Images can be added later from the Products tab.</p>

              {/* Excel Format Guide */}
              <div className="bg-wood-50 rounded-xl p-4 mb-6 border border-wood-100">
                <p className="text-wood-700 text-sm font-medium mb-2">📋 Excel Format Guide:</p>
                <p className="text-wood-600 text-xs mb-3">Make sure the first row contains these exact column names (lowercase or uppercase):</p>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs bg-white border border-wood-100 rounded-lg">
                    <thead>
                      <tr className="bg-wood-50 border-b border-wood-100">
                        <th className="py-2 px-3 text-left font-medium text-wood-700">name *</th>
                        <th className="py-2 px-3 text-left font-medium text-wood-700">category *</th>
                        <th className="py-2 px-3 text-left font-medium text-wood-700">price</th>
                        <th className="py-2 px-3 text-left font-medium text-wood-700">material</th>
                        <th className="py-2 px-3 text-left font-medium text-wood-700">dimensions</th>
                        <th className="py-2 px-3 text-left font-medium text-wood-700">finish</th>
                        <th className="py-2 px-3 text-left font-medium text-wood-700">warranty</th>
                        <th className="py-2 px-3 text-left font-medium text-wood-700">description</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-wood-50 text-wood-500">
                        <td className="py-2 px-3 font-semibold text-charcoal-950">Royal Bed</td>
                        <td className="py-2 px-3">bedroom</td>
                        <td className="py-2 px-3">35000-55000</td>
                        <td className="py-2 px-3">Solid Sheesham Wood</td>
                        <td className="py-2 px-3">6x6 ft</td>
                        <td className="py-2 px-3">Walnut</td>
                        <td className="py-2 px-3">2 Year Warranty</td>
                        <td className="py-2 px-3">Handcrafted sheesham double bed...</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p className="text-[10px] text-wood-400 mt-2">* Note: "category" must match the slug of an existing category (e.g. living, bedroom, dining, office).</p>
              </div>

              {/* Upload Area */}
              <label className="flex flex-col items-center justify-center border-2 border-dashed border-wood-300 rounded-xl p-8 cursor-pointer hover:border-wood-500 hover:bg-wood-50 transition-all">
                <span className="text-4xl mb-3">📊</span>
                <span className="text-wood-600 font-medium">{excelFileName || 'Click to choose Excel file'}</span>
                <span className="text-wood-400 text-xs mt-1">Supports .xlsx and .xls files</span>
                <input type="file" accept=".xlsx, .xls" onChange={handleExcelUpload} className="hidden" />
              </label>
            </div>

            {/* Preview Table */}
            {excelData.length > 0 && (
              <div className="bg-white rounded-2xl shadow-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-playfair text-lg font-bold text-charcoal-900">
                    Preview ({excelData.length} products)
                  </h3>
                  <div className="flex gap-3">
                    <button onClick={() => { setExcelData([]); setExcelFileName(''); }}
                      className="btn-secondary text-sm px-4 py-2">Clear</button>
                    <button onClick={handleBulkImport} disabled={bulkUploading}
                      className="btn-primary text-sm px-4 py-2 disabled:opacity-70">
                      {bulkUploading ? '⏳ Importing...' : `📤 Import ${excelData.length} Products`}
                    </button>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-wood-200">
                        <th className="text-left py-2 px-3 text-wood-500 font-medium">#</th>
                        <th className="text-left py-2 px-3 text-wood-500 font-medium">Name</th>
                        <th className="text-left py-2 px-3 text-wood-500 font-medium">Category</th>
                        <th className="text-left py-2 px-3 text-wood-500 font-medium">Price</th>
                        <th className="text-left py-2 px-3 text-wood-500 font-medium">Material</th>
                        <th className="text-left py-2 px-3 text-wood-500 font-medium">Warranty</th>
                      </tr>
                    </thead>
                    <tbody>
                      {excelData.slice(0, 20).map((row, idx) => (
                        <tr key={idx} className="border-b border-wood-50 hover:bg-wood-50">
                          <td className="py-2 px-3 text-wood-400">{idx + 1}</td>
                          <td className="py-2 px-3 font-medium text-charcoal-900">{row.name}</td>
                          <td className="py-2 px-3 text-wood-600">{row.category}</td>
                          <td className="py-2 px-3 text-wood-600">{row.price}</td>
                          <td className="py-2 px-3 text-wood-500">{row.material}</td>
                          <td className="py-2 px-3 text-wood-500">{row.warranty}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {excelData.length > 20 && (
                    <p className="text-wood-400 text-xs text-center py-2">...and {excelData.length - 20} more rows</p>
                  )}
                </div>
              </div>
            )}

            {/* Bulk Result */}
            {bulkResult && (
              <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
                <p className="text-green-700 font-semibold text-lg">✅ Import Complete!</p>
                <p className="text-green-600 text-sm mt-1">{bulkResult.success} products added successfully. {bulkResult.failed > 0 ? `${bulkResult.failed} failed.` : ''}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Delete Product Confirm Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay animate-fade-in">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-scale-in">
            <h3 className="font-playfair text-lg font-bold text-charcoal-900 mb-2">Delete Product?</h3>
            <p className="text-wood-600 text-sm mb-5">Are you sure you want to delete <strong>{deleteConfirm.name}</strong>? This cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => handleDelete(deleteConfirm)} disabled={loading}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-2.5 rounded-xl transition-colors disabled:opacity-70">
                {loading ? 'Deleting...' : 'Yes, Delete'}
              </button>
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 btn-secondary">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Category Confirm Modal */}
      {deleteCatConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay animate-fade-in">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-scale-in">
            <h3 className="font-playfair text-lg font-bold text-charcoal-900 mb-2">Delete Category?</h3>
            <p className="text-wood-600 text-sm mb-5">Are you sure you want to delete <strong>{deleteCatConfirm.emoji} {deleteCatConfirm.name}</strong>? Products in this category will not be deleted.</p>
            <div className="flex gap-3">
              <button onClick={() => handleDeleteCat(deleteCatConfirm)} disabled={loading}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-2.5 rounded-xl transition-colors disabled:opacity-70">
                {loading ? 'Deleting...' : 'Yes, Delete'}
              </button>
              <button onClick={() => setDeleteCatConfirm(null)} className="flex-1 btn-secondary">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Banner Confirm Modal */}
      {deleteBannerConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay animate-fade-in">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-scale-in">
            <h3 className="font-playfair text-lg font-bold text-charcoal-900 mb-2">Delete Banner?</h3>
            <p className="text-wood-600 text-sm mb-5">Are you sure you want to delete this banner? This cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => handleDeleteBanner(deleteBannerConfirm)} disabled={loading}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-2.5 rounded-xl transition-colors disabled:opacity-70">
                {loading ? 'Deleting...' : 'Yes, Delete'}
              </button>
              <button onClick={() => setDeleteBannerConfirm(null)} className="flex-1 btn-secondary">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* 📈 Traffic Visitor Logs Modal */}
      {showTrafficModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay animate-fade-in">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full shadow-2xl animate-scale-in flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between pb-4 border-b border-wood-100">
              <h3 className="font-playfair text-lg font-bold text-charcoal-900">📈 Traffic & Visitor Session Logs</h3>
              <button onClick={() => setShowTrafficModal(false)} className="text-wood-400 hover:text-wood-700 transition-colors">
                ✕
              </button>
            </div>
            
            {/* Modal Body */}
            <div className="overflow-y-auto flex-1 my-4 space-y-3">
              {visitsStats.visits && visitsStats.visits.length > 0 ? (
                <div className="divide-y divide-wood-50">
                  {visitsStats.visits.slice().sort((a, b) => {
                    const tA = a.timestamp?.seconds || 0;
                    const tB = b.timestamp?.seconds || 0;
                    return tB - tA; // Newest first
                  }).map((v, idx) => {
                    const date = v.timestamp ? new Date(v.timestamp.seconds * 1000).toLocaleString() : 'Just now';
                    
                    // Simple UserAgent Parser
                    let device = 'Desktop';
                    if (/Mobi|Android|iPhone/i.test(v.userAgent)) device = '📱 Mobile / Tablet';
                    else if (/Macintosh/i.test(v.userAgent)) device = '💻 Mac';
                    else if (/Windows/i.test(v.userAgent)) device = '💻 Windows';
                    
                    let browser = 'Chrome/Safari';
                    if (/Firefox/i.test(v.userAgent)) browser = 'Firefox';
                    else if (/Edg/i.test(v.userAgent)) browser = 'Edge';

                    return (
                      <div key={idx} className="py-3 flex justify-between gap-3 text-xs">
                        <div>
                          <p className="font-semibold text-charcoal-900">Visitor ID: <span className="font-mono text-[10px] text-wood-500">{v.visitorId}</span></p>
                          <p className="text-wood-400 mt-0.5">{device} · {browser}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <span className="bg-wood-50 text-wood-600 px-2 py-0.5 rounded-lg">{date}</span>
                        </div>
                      </div>
                    );
                  })
                  }
                </div>
              ) : (
                <p className="text-center py-8 text-wood-400 text-sm">No visitor logs found yet.</p>
              )}
            </div>

            <div className="pt-4 border-t border-wood-100 flex justify-end">
              <button onClick={() => setShowTrafficModal(false)} className="btn-secondary text-sm px-6 py-2">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
