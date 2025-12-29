
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: '首頁', icon: 'fa-home' },
    { path: '/policies', label: '保單管理', icon: 'fa-shield-halved' },
    { path: '/event', label: '事故報核', icon: 'fa-file-medical' },
  ];

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
                <i className="fas fa-file-invoice-dollar text-sm"></i>
              </div>
              <span className="font-bold text-xl tracking-tight text-slate-800">ClaimEstimate</span>
            </div>
            <div className="hidden md:flex space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-1 pt-1 text-sm font-bold border-b-2 transition-colors ${
                    location.pathname === item.path
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <i className={`fas ${item.icon}`}></i>
                  {item.label}
                </Link>
              ))}
            </div>
            <div className="md:hidden">
                <i className="fas fa-bars text-slate-600"></i>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-grow max-w-5xl mx-auto w-full px-4 py-8">
        {children}
      </main>

      <footer className="bg-slate-50 border-t border-slate-200 py-8 mt-auto">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <p className="text-slate-400 text-xs font-medium">
            © 2024 ClaimEstimate AI Advisor. 本工具僅供理賠試算 Benchmark 使用，不具備法律效力。
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
