import { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { ChartPie, BookOpen, Download, Code, Atom, Lock, LogIn, Loader2, X, LogOut, User } from 'lucide-react';
import { useAuth } from './AuthContext';

function LoginModal({ onClose }) {
  const { login } = useAuth();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(username, password);
      onClose();
    } catch {
      setError('Invalid credentials. Try admin / admin');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" />
      <div className="relative z-10 w-full max-w-sm rounded-2xl border border-white/10 bg-[rgba(15,23,42,0.97)] shadow-2xl shadow-purple-900/40 p-8 animate-in fade-in zoom-in-95 duration-300">
        {/* Skip guest mode */}
        <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-lg text-text-muted hover:text-white hover:bg-white/10 transition-colors">
          <X className="w-4 h-4" />
        </button>

        <div className="flex flex-col items-center gap-2 mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center shadow-lg shadow-purple-900/40 mb-2">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white">Welcome Back</h2>
          <p className="text-text-muted text-sm text-center">Sign in to access the Harvester and admin features</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-text-muted mb-1.5">Username</label>
            <input
              type="text"
              className="input-field w-full"
              value={username}
              onChange={e => setUsername(e.target.value)}
              autoFocus
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-text-muted mb-1.5">Password</label>
            <input
              type="password"
              className="input-field w-full"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">{error}</p>
          )}

          <button type="submit" disabled={loading} className="btn gradient-btn w-full justify-center py-3 mt-2">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function Layout() {
  const { token, user, logout } = useAuth();
  const [showLogin, setShowLogin] = useState(false);

  const tabs = [
    { to: "/", icon: ChartPie, label: "Dashboard" },
    { to: "/explore", icon: BookOpen, label: "Explore" },
    { to: "/harvester", icon: Download, label: "Harvester" },
    { to: "/api-docs", icon: Code, label: "API Docs" },
  ];

  return (
    <>
      {/* Background Orbs */}
      <div className="background-orbs">
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
        <div className="orb orb-3"></div>
      </div>

      {/* Login modal */}
      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}

      {/* Main Container */}
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="glass-panel w-full max-w-7xl h-[90vh] flex flex-col overflow-hidden">
          {/* Header */}
          <header className="flex justify-between items-center p-6 border-b border-glass-border">
            <div className="flex items-center gap-3 font-extrabold text-xl uppercase tracking-wider text-white">
              <Atom className="text-accent-pink w-8 h-8" />
              <span>SciHarvester</span>
            </div>

            <nav className="flex gap-2">
              {tabs.map((tab) => (
                <NavLink
                  key={tab.to}
                  to={tab.to}
                  end={tab.to === "/"}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all duration-300 ${
                      isActive
                        ? 'bg-white/10 text-white shadow-[inset_0_0_10px_rgba(255,255,255,0.05)]'
                        : 'text-text-muted hover:bg-white/5 hover:text-white'
                    }`
                  }
                >
                  <tab.icon className="w-5 h-5" />
                  {tab.label}
                </NavLink>
              ))}
            </nav>

            {/* Auth area */}
            {token ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-sm text-green-400 bg-green-400/10 border border-green-500/20 px-3 py-1.5 rounded-full font-semibold">
                  <User className="w-3.5 h-3.5" />
                  {user}
                </div>
                <button
                  onClick={logout}
                  className="p-2 rounded-xl text-text-muted hover:text-white hover:bg-white/10 transition-colors"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowLogin(true)}
                className="btn primary-btn flex items-center gap-2 py-2 px-4"
              >
                <LogIn className="w-4 h-4" />
                Sign In
              </button>
            )}
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
            <Outlet />
          </main>
        </div>
      </div>
    </>
  );
}

