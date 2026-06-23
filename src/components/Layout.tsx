import React from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Overview', path: '/dashboard' },
    { label: 'Tropel Atlas', path: '/tropels' },
    { label: 'Signal Feed', path: '/signals' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#0b0c10] text-[#c5c6c7] font-sans antialiased selection:bg-indigo-500 selection:text-white">
      {/* Glow Effects */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[300px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-0 right-1/4 w-[500px] h-[300px] bg-purple-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Futuristic Top Bar */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-[#0f111a]/80 border-b border-indigo-500/10 shadow-lg shadow-black/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shadow-md shadow-indigo-500/20">
                <span className="text-white font-bold text-lg tracking-wider">T</span>
              </div>
              <div>
                <span className="text-white font-semibold tracking-wider text-sm sm:text-base">TUCKERSOFT</span>
                <span className="text-indigo-400 font-mono text-xs block -mt-1 tracking-widest">TROPELCARE CONSOLE</span>
              </div>
            </div>

            {/* Navigation links */}
            <nav className="hidden md:flex space-x-1">
              {navItems.map((item) => {
                const isActive = location.pathname.startsWith(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`px-4 py-2 rounded-lg text-sm font-medium tracking-wide transition-all duration-300 ${
                      isActive
                        ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-inner'
                        : 'text-gray-400 hover:text-white hover:bg-gray-800/40 border border-transparent'
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* Operator Status & Actions */}
            {user && (
              <div className="flex items-center space-x-4">
                {/* User Info Badge */}
                <div className="hidden sm:flex flex-col text-right">
                  <span className="text-white text-xs font-semibold tracking-wide flex items-center justify-end space-x-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block mr-1"></span>
                    <span>{user.displayName}</span>
                  </span>
                  <span className="text-[10px] font-mono text-indigo-400 tracking-wider">
                    {user.role} | <span className="bg-indigo-500/10 px-1 rounded border border-indigo-500/20 text-indigo-300">{user.teamCode}</span>
                  </span>
                </div>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="px-3.5 py-1.5 text-xs font-mono font-semibold text-rose-400 border border-rose-500/20 rounded-md hover:bg-rose-500/10 hover:border-rose-500/40 hover:shadow-[0_0_10px_rgba(244,63,94,0.1)] transition-all duration-300 focus:outline-none"
                >
                  DISCONNECT
                </button>
              </div>
            )}
            
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="md:hidden border-t border-indigo-500/5 bg-[#0b0c10]/90 px-4 py-2 flex justify-around">
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-300 ${
                  isActive
                    ? 'text-indigo-400 bg-indigo-500/10 border border-indigo-500/20'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
        {children}
      </main>

      {/* Sci-Fi Status Footer */}
      <footer className="border-t border-indigo-500/5 bg-[#07080c] py-4 text-center text-[10px] font-mono text-gray-600 tracking-wider">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
          <span>SYSTEM_STATUS: OK // WORKSPACE_TENANT: {user?.teamCode || 'UNAUTHENTICATED'}</span>
          <span>PIZZA PROTOCOL VER_1.0 // TUCKERSOFT © 2026</span>
        </div>
      </footer>
    </div>
  );
};
