import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './firebase/config';
import CatalogPage from './pages/CatalogPage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboard from './components/admin/AdminDashboard';
import useProducts from './hooks/useProducts';
import useCategories from './hooks/useCategories';
import useBanners from './hooks/useBanners';
import useVisits from './hooks/useVisits';

const AdminRoute = () => {
  const [user, setUser] = useState(undefined); // undefined = loading
  const { products } = useProducts();
  const { categories } = useCategories();
  const { banners } = useBanners();
  const { stats: visitsStats } = useVisits();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      if (u) {
        // Read allowed email from env configuration (hidden from GitHub)
        const allowedEmail = import.meta.env.VITE_ALLOWED_ADMIN_EMAIL;
        const isAuthorized = u.email === allowedEmail;
                             
        if (!isAuthorized) {
          await signOut(auth);
          setUser(null);
        } else {
          setUser(u);
        }
      } else {
        setUser(null);
      }
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

  return (
    <AdminDashboard 
      products={products} 
      categories={categories} 
      banners={banners} 
      visitsStats={visitsStats}
      onLogout={handleLogout} 
      userEmail={user.email} 
    />
  );
};

function App() {
  useEffect(() => {
    // 1. Disable Right Click context menu
    const preventContextMenu = (e) => {
      e.preventDefault();
    };
    document.addEventListener('contextmenu', preventContextMenu);

    // 2. Disable Keyboard Shortcuts (Ctrl+C, Ctrl+S, Ctrl+P, F12, inspect tools)
    const handleKeyDown = (e) => {
      if (
        e.key === 'F12' ||
        // Ctrl+Shift+I / J / C (Dev tools)
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j' || e.key === 'C' || e.key === 'c')) ||
        // Command+Option+I / J / C (Mac Dev tools)
        (e.metaKey && e.altKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j' || e.key === 'C' || e.key === 'c')) ||
        // Ctrl+U (View Source)
        (e.ctrlKey && (e.key === 'U' || e.key === 'u')) ||
        // Ctrl+S / Cmd+S (Save page)
        ((e.ctrlKey || e.metaKey) && (e.key === 'S' || e.key === 's')) ||
        // Ctrl+P / Cmd+P (Print page)
        ((e.ctrlKey || e.metaKey) && (e.key === 'P' || e.key === 'p')) ||
        // Ctrl+C / Cmd+C (Copy)
        ((e.ctrlKey || e.metaKey) && (e.key === 'C' || e.key === 'c'))
      ) {
        e.preventDefault();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    // 3. Clear Clipboard on PrintScreen keyup event
    const handleKeyUp = async (e) => {
      if (e.key === 'PrintScreen' || e.key === 'PrtScn') {
        try {
          await navigator.clipboard.writeText('Screenshots of products are restricted for safety.');
        } catch (_) {}
      }
    };
    window.addEventListener('keyup', handleKeyUp);

    // 4. Blur page when window loses focus (Snipping tool / screenshot capture mode triggers blur)
    const handleBlur = () => {
      document.getElementById('root')?.classList.add('screen-blur');
    };
    const handleFocus = () => {
      document.getElementById('root')?.classList.remove('screen-blur');
    };
    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('contextmenu', preventContextMenu);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<CatalogPage />} />
        <Route path="/admin" element={<AdminRoute />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
