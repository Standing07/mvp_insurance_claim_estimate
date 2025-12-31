
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { language, setLanguage, t } = useLanguage();
  const [user, setUser] = useState<{name: string, email: string} | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('claimestimate_current_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    } else {
      if (location.pathname !== '/' && location.pathname !== '/login') {
        navigate('/login');
      }
    }
  }, [location.pathname, navigate]);

  const handleLogout = () => {
    if(confirm(language === 'zh-TW' ? '確定要登出嗎？' : 'Are you sure you want to logout?')) {
      localStorage.removeItem('claimestimate_current_user');
      setUser(null);
      navigate('/');
    }
  };

  const navItems = [
    { path: '/', label: t('nav.home'), icon: 'fa-home' },
    { path: '/policies', label: t('nav.policies'), icon: 'fa-shield-halved' },
    { path: '/event', label: t('nav.event'), icon: 'fa-file-medical' },
  ];

  const toggleLang = () => {
    setLanguage(language === 'zh-TW' ? 'en-US' : 'zh-TW');
  };

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
                <i className="fas fa-file-invoice-dollar text-sm"></i>
              </div>
              <span className="font-bold text-xl tracking-tight text-slate-800">{t('app.name')}</span>
            </Link>
            
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

            <div className="flex items-center gap-4">
               {/* Language Switcher */}
               <button 
                 onClick={toggleLang}
                 className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-bold hover:bg-slate-200 transition-colors"
               >
                 <i className="fas fa-globe mr-1"></i>
                 {language === 'zh-TW' ? 'EN' : '中文'}
               </button>

               {user ? (
                 <div className="flex items-center gap-3">
                   <div className="hidden sm:flex flex-col items-end">
                     <span className="text-xs font-black text-slate-700">{user.name}</span>
                     <span className="text-[10px] text-slate-400">{t('nav.user')}</span>
                   </div>
                   <button 
                      onClick={handleLogout}
                      className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-rose-50 hover:text-rose-500 flex items-center justify-center transition-colors"
                      title={t('nav.logout')}
                   >
                     <i className="fas fa-right-from-bracket text-xs"></i>
                   </button>
                 </div>
               ) : (
                 <Link 
                   to="/login"
                   className="bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
                 >
                   <i className="fas fa-user-circle mr-2"></i>
                   {t('nav.login')}
                 </Link>
               )}
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
            {t('footer.text')}
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
