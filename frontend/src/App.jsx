import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './firebase/config';
import CatalogPage from './pages/CatalogPage';
import PrintCatalogPage from './pages/PrintCatalogPage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboard from './components/admin/AdminDashboard';
import useProducts from './hooks/useProducts';
import useCategories from './hooks/useCategories';
import useBanners from './hooks/useBanners';
import useVisits from './hooks/useVisits';

// Inner component — only renders when user is confirmed logged in
// This ensures Firestore admin-only listeners (visits, events) only
// subscribe AFTER auth is established, preventing permission-denied errors.
const AuthenticatedAdmin = ({ user, onLogout }) => {
  const { products } = useProducts();
  const { categories } = useCategories();
  const { banners } = useBanners();
  const { stats: visitsStats } = useVisits();

  return (
    <AdminDashboard
      products={products}
      categories={categories}
      banners={banners}
      visitsStats={visitsStats}
      onLogout={onLogout}
      userEmail={user.email}
    />
  );
};

const AdminRoute = () => {
  const [user, setUser] = useState(undefined); // undefined = loading

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u || null);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = () => signOut(auth);

  // Loading state
  if (user === undefined) {
    return (
      <div className="min-h-screen bg-hero-gradient flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-wood-400/30 border-t-wood-400 rounded-full animate-spin" />
          <p className="text-wood-300 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AdminLoginPage onLogin={() => {}} />;
  }

  return <AuthenticatedAdmin user={user} onLogout={handleLogout} />;
};


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<CatalogPage />} />
        <Route path="/admin" element={<AdminRoute />} />
        <Route path="/print-catalog" element={<PrintCatalogPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
