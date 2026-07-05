import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase/config';

const AdminLoginPage = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // ✅ Check if the logged-in email belongs to Sagar Furniture Manager
      const allowedEmail = import.meta.env.VITE_ALLOWED_ADMIN_EMAIL;
      const isAuthorized = user.email === allowedEmail;
      
      if (!isAuthorized) {
        // Kick out unauthorized users
        const { signOut } = await import('firebase/auth');
        await signOut(auth);
        setError('Unauthorized: This email does not have Manager access.');
        setLoading(false);
      } else {
        onLogin();
      }
    } catch (err) {
      setError('Invalid email or password. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-hero-gradient flex items-center justify-center p-4">
      <div className="absolute top-0 right-0 w-96 h-96 bg-wood-600/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-wood-400/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl" />

      <div className="relative w-full max-w-md animate-scale-in">
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-wood-gradient rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-wood">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
              </svg>
            </div>
            <h1 className="font-playfair text-2xl font-bold text-white mb-1">Sagar Furniture</h1>
            
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-wood-200 text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email..."
                required
                className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-xl
                           text-white placeholder-white/40 font-outfit
                           focus:outline-none focus:border-wood-400 focus:ring-2 focus:ring-wood-400/30
                           transition-all duration-300"
              />
            </div>
            <div>
              <label className="block text-wood-200 text-sm font-medium mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password..."
                required
                className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-xl
                           text-white placeholder-white/40 font-outfit
                           focus:outline-none focus:border-wood-400 focus:ring-2 focus:ring-wood-400/30
                           transition-all duration-300"
              />
            </div>

            {error && (
              <div className="bg-red-500/20 border border-red-400/40 rounded-xl px-4 py-3 text-red-200 text-sm animate-fade-in">
                ⚠️ {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-70 mt-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <a href="/" className="text-wood-300/70 text-sm hover:text-wood-300 transition-colors">
              ← Back to Catalog
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
