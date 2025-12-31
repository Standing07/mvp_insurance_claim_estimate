
import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

const Home: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col items-center justify-center space-y-16 py-12">
      <div className="text-center max-w-3xl">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-full text-xs font-bold uppercase tracking-widest mb-6">
          <i className="fas fa-sparkles"></i> {t('home.badge')}
        </div>
        <h1 className="text-5xl md:text-6xl font-black text-slate-900 mb-8 leading-[1.15]">
          {t('home.title.prefix')} <br/><span className="text-indigo-600 italic">{t('home.title.suffix')}</span>
        </h1>
        <p className="text-xl text-slate-500 mb-10 leading-relaxed max-w-2xl mx-auto">
          {t('home.desc')}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/policies"
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-10 rounded-2xl shadow-xl shadow-indigo-200 transition-all transform hover:-translate-y-1 active:scale-95 text-lg"
          >
            {t('home.btn.policies')}
          </Link>
          <Link
            to="/event"
            className="bg-white border border-slate-200 text-slate-700 font-bold py-4 px-10 rounded-2xl hover:bg-slate-50 transition-all shadow-sm text-lg"
          >
            {t('home.btn.event')}
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col items-center text-center group hover:border-indigo-100 transition-all">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-6 group-hover:scale-110 transition-transform">
            <i className="fas fa-shield-halved text-2xl"></i>
          </div>
          <h3 className="font-bold text-xl mb-3 text-slate-800">{t('home.feat1.title')}</h3>
          <p className="text-slate-400 text-sm leading-relaxed">{t('home.feat1.desc')}</p>
        </div>
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col items-center text-center group hover:border-emerald-100 transition-all">
          <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 mb-6 group-hover:scale-110 transition-transform">
            <i className="fas fa-heart-pulse text-2xl"></i>
          </div>
          <h3 className="font-bold text-xl mb-3 text-slate-800">{t('home.feat2.title')}</h3>
          <p className="text-slate-400 text-sm leading-relaxed">{t('home.feat2.desc')}</p>
        </div>
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col items-center text-center group hover:border-amber-100 transition-all">
          <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 mb-6 group-hover:scale-110 transition-transform">
            <i className="fas fa-chart-line text-2xl"></i>
          </div>
          <h3 className="font-bold text-xl mb-3 text-slate-800">{t('home.feat3.title')}</h3>
          <p className="text-slate-400 text-sm leading-relaxed">{t('home.feat3.desc')}</p>
        </div>
      </div>
    </div>
  );
};

export default Home;
