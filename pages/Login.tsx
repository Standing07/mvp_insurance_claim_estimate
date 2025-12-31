
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const userId = btoa(email); 
    const user = {
      id: userId,
      name: name || email.split('@')[0],
      email: email
    };

    localStorage.setItem('claimestimate_current_user', JSON.stringify(user));
    
    alert(`${t('login.welcome')}, ${user.name}！`);
    window.location.href = '#/';
    window.location.reload();
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl shadow-indigo-100 border border-slate-100 w-full max-w-md animate-scaleIn">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 text-white text-2xl shadow-lg shadow-indigo-200">
            <i className="fas fa-user-shield"></i>
          </div>
          <h2 className="text-3xl font-black text-slate-900">{isRegister ? t('login.register') : t('login.login')}</h2>
          <p className="text-slate-400 mt-2 font-medium">
            {isRegister ? t('login.desc.register') : t('login.desc.login')}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {isRegister && (
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">{t('login.label.name')}</label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('login.ph.name')}
                required={isRegister}
                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-700"
              />
            </div>
          )}
          
          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">{t('login.label.email')}</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              required
              className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-700"
            />
          </div>

          <button 
            type="submit" 
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl shadow-xl shadow-indigo-100 transition-all active:scale-95"
          >
            {isRegister ? t('login.btn.register') : t('login.btn.login')}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button 
            onClick={() => setIsRegister(!isRegister)}
            className="text-sm font-bold text-slate-400 hover:text-indigo-600 transition-colors"
          >
            {isRegister ? t('login.switch.toLogin') : t('login.switch.toRegister')}
          </button>
        </div>
        
        <div className="mt-6 pt-6 border-t border-slate-50 text-center">
             <p className="text-[10px] text-slate-300">
                {t('login.note')}
             </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
