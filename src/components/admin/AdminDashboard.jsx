import { useState } from 'react';
import { addProduct, updateProduct, deleteProduct } from '../../services/productService';

const CATEGORIES = [
  { id: 'living', label: 'Living Room 🛋️' },
  { id: 'bedroom', label: 'Bedroom 🛏️' },
  { id: 'dining', label: 'Dining Room 🍽️' },
  { id: 'office', label: 'Office 💼' },
];

const EMPTY_FORM = {
  name: '', category: 'living', price: '',
  material: '', dimensions: '', finish: '',
  warranty: '', description: '',
};

const AdminDashboard = ({ products, onLogout, userEmail }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [toast, setToast] = useState('');

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setForm({
      name: product.name || '',
      category: product.category || 'living',
      price: product.price || '',
      material: product.material || '',
      dimensions: product.dimensions || '',
      finish: product.finish || '',
      warranty: product.warranty || '',
      description: product.description || '',
    });
    setImagePreview(product.imageUrl || '');
    setImageFile(null);
    setShowForm(true);
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
      setForm(EMPTY_FORM);
      setImageFile(null);
      setImagePreview('');
      setEditingProduct(null);
      setShowForm(false);
    } catch (err) {
      showToast('❌ Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (product) => {
    setLoading(true);
    try {
      await deleteProduct(product.id);
      showToast('🗑️ Product deleted.');
      setDeleteConfirm(null);
    } catch (err) {
      showToast('❌ Error: ' + err.message);
    } finally {
      setLoading(false);
    }
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
      <header className="bg-dark-gradient bg-charcoal-950 text-white px-4 py-4 shadow-xl">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="font-playfair text-xl font-bold text-wood-300">
              Sagar Furniture — Admin Panel
            </h1>
            <p className="text-wood-100/50 text-xs">{userEmail} · {products.length} Products</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => { setEditingProduct(null); setForm(EMPTY_FORM); setImagePreview(''); setShowForm(true); }}
              className="btn-primary text-sm px-4 py-2"
            >
              + Add Product
            </button>
            <button
              onClick={onLogout}
              className="text-wood-300/70 hover:text-wood-300 text-sm transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Add/Edit Form */}
        {showForm && (
          <div className="bg-white rounded-2xl shadow-card p-6 mb-8 animate-slide-up">
            <h2 className="font-playfair text-xl font-bold text-charcoal-900 mb-6">
              {editingProduct ? '✏️ Edit Product' : '➕ Add New Product'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-wood-700 text-sm font-medium mb-1">Product Name *</label>
                  <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Royal Teak Double Bed"
                    className="w-full px-4 py-2.5 border-2 border-wood-200 rounded-xl focus:outline-none focus:border-wood-500 transition-all" />
                </div>
                <div>
                  <label className="block text-wood-700 text-sm font-medium mb-1">Category *</label>
                  <select required value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full px-4 py-2.5 border-2 border-wood-200 rounded-xl focus:outline-none focus:border-wood-500 transition-all bg-white">
                    {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-wood-700 text-sm font-medium mb-1">Price Range</label>
                  <input value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })}
                    placeholder="e.g. ₹25,000 - ₹45,000"
                    className="w-full px-4 py-2.5 border-2 border-wood-200 rounded-xl focus:outline-none focus:border-wood-500 transition-all" />
                </div>
                <div>
                  <label className="block text-wood-700 text-sm font-medium mb-1">Material / Wood Type</label>
                  <input value={form.material} onChange={(e) => setForm({ ...form, material: e.target.value })}
                    placeholder="e.g. Solid Sheesham Wood"
                    className="w-full px-4 py-2.5 border-2 border-wood-200 rounded-xl focus:outline-none focus:border-wood-500 transition-all" />
                </div>
                <div>
                  <label className="block text-wood-700 text-sm font-medium mb-1">Dimensions / Size</label>
                  <input value={form.dimensions} onChange={(e) => setForm({ ...form, dimensions: e.target.value })}
                    placeholder="e.g. 6x6 ft | Height: 42 inch"
                    className="w-full px-4 py-2.5 border-2 border-wood-200 rounded-xl focus:outline-none focus:border-wood-500 transition-all" />
                </div>
                <div>
                  <label className="block text-wood-700 text-sm font-medium mb-1">Polish / Finish</label>
                  <input value={form.finish} onChange={(e) => setForm({ ...form, finish: e.target.value })}
                    placeholder="e.g. Walnut / Honey / Natural"
                    className="w-full px-4 py-2.5 border-2 border-wood-200 rounded-xl focus:outline-none focus:border-wood-500 transition-all" />
                </div>
                <div>
                  <label className="block text-wood-700 text-sm font-medium mb-1">Warranty</label>
                  <input value={form.warranty} onChange={(e) => setForm({ ...form, warranty: e.target.value })}
                    placeholder="e.g. 2 Year Warranty"
                    className="w-full px-4 py-2.5 border-2 border-wood-200 rounded-xl focus:outline-none focus:border-wood-500 transition-all" />
                </div>
              </div>

              <div>
                <label className="block text-wood-700 text-sm font-medium mb-1">Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3} placeholder="Describe the furniture..."
                  className="w-full px-4 py-2.5 border-2 border-wood-200 rounded-xl focus:outline-none focus:border-wood-500 transition-all resize-none" />
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-wood-700 text-sm font-medium mb-2">
                  Upload Photo
                  <span className="ml-2 text-xs text-wood-400 font-normal">(Cloudinary — Free Storage)</span>
                </label>
                <div className="flex items-start gap-4">
                  <label className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-wood-300 rounded-xl p-6 cursor-pointer hover:border-wood-500 hover:bg-wood-50 transition-all">
                    <svg className="w-8 h-8 text-wood-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
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

              <div className="flex gap-3">
                <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2 disabled:opacity-70">
                  {loading
                    ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</>
                    : '💾 Save Product'}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Products List */}
        <div className="space-y-4">
          <h2 className="font-playfair text-xl font-bold text-charcoal-900">
            All Products ({products.length})
          </h2>

          {products.length === 0 && (
            <div className="text-center py-16 bg-white rounded-2xl shadow-card">
              <div className="text-5xl mb-3">🪑</div>
              <p className="text-wood-500">No products yet. Click "+ Add Product" to get started.</p>
            </div>
          )}

          {products.map((product) => (
            <div key={product.id} className="card flex flex-col sm:flex-row gap-4 p-4 hover:translate-y-0">
              <img
                src={product.imageUrl || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=200&q=80'}
                alt={product.name}
                className="w-full sm:w-28 h-28 object-cover rounded-xl flex-shrink-0"
                onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=200&q=80'; }}
              />
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-charcoal-900 mb-1 truncate">{product.name}</h3>
                <p className="text-wood-500 text-sm">{product.material} {product.dimensions ? `| ${product.dimensions}` : ''}</p>
                {product.price && <p className="text-wood-700 font-medium text-sm">₹ {product.price}</p>}
                <span className="badge bg-wood-100 text-wood-700 mt-2 inline-block">
                  {CATEGORIES.find(c => c.id === product.category)?.label || product.category}
                </span>
              </div>
              <div className="flex sm:flex-col gap-2 justify-end">
                <button
                  onClick={() => handleEdit(product)}
                  className="px-4 py-2 bg-wood-100 text-wood-700 rounded-xl text-sm font-medium hover:bg-wood-200 transition-colors"
                >
                  ✏️ Edit
                </button>
                <button
                  onClick={() => setDeleteConfirm(product)}
                  className="px-4 py-2 bg-red-50 text-red-600 rounded-xl text-sm font-medium hover:bg-red-100 transition-colors"
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Delete Confirm Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay animate-fade-in">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-scale-in">
            <h3 className="font-playfair text-lg font-bold text-charcoal-900 mb-2">Delete Product?</h3>
            <p className="text-wood-600 text-sm mb-5">
              Are you sure you want to delete <strong>{deleteConfirm.name}</strong>? This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button onClick={() => handleDelete(deleteConfirm)} disabled={loading}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-2.5 rounded-xl transition-colors disabled:opacity-70">
                {loading ? 'Deleting...' : 'Yes, Delete'}
              </button>
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 btn-secondary">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
