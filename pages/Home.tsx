
import React from 'react';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center space-y-16 py-12">
      <div className="text-center max-w-3xl">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-full text-xs font-bold uppercase tracking-widest mb-6">
          <i className="fas fa-sparkles"></i> AI 驅動理賠試算
        </div>
        <h1 className="text-5xl md:text-6xl font-black text-slate-900 mb-8 leading-[1.15]">
          AI 助你理賠 <br/><span className="text-indigo-600 italic">知多少</span>
        </h1>
        <p className="text-xl text-slate-500 mb-10 leading-relaxed max-w-2xl mx-auto">
          <strong className="text-slate-800">ClaimEstimate</strong> 是專為保戶設計的理賠好幫手：透過 AI 分析您的保單與證明單據，快速估算可能理賠金額，作為後續理賠的參考。
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/policies"
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-10 rounded-2xl shadow-xl shadow-indigo-200 transition-all transform hover:-translate-y-1 active:scale-95 text-lg"
          >
            立即管理保單
          </Link>
          <Link
            to="/event"
            className="bg-white border border-slate-200 text-slate-700 font-bold py-4 px-10 rounded-2xl hover:bg-slate-50 transition-all shadow-sm text-lg"
          >
            事故快速模擬
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col items-center text-center group hover:border-indigo-100 transition-all">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-6 group-hover:scale-110 transition-transform">
            <i className="fas fa-shield-halved text-2xl"></i>
          </div>
          <h3 className="font-bold text-xl mb-3 text-slate-800">1. 建立保單庫</h3>
          <p className="text-slate-400 text-sm leading-relaxed">內建結構化選單，涵蓋各大保險公司與停賣險種，輕鬆建立個人保障清單。</p>
        </div>
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col items-center text-center group hover:border-emerald-100 transition-all">
          <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 mb-6 group-hover:scale-110 transition-transform">
            <i className="fas fa-heart-pulse text-2xl"></i>
          </div>
          <h3 className="font-bold text-xl mb-3 text-slate-800">2. 專業事故模擬</h3>
          <p className="text-slate-400 text-sm leading-relaxed">細分壽險、醫療、傷害等六大類別，透過選單精確描述事故與診療狀況。</p>
        </div>
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col items-center text-center group hover:border-amber-100 transition-all">
          <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 mb-6 group-hover:scale-110 transition-transform">
            <i className="fas fa-chart-line text-2xl"></i>
          </div>
          <h3 className="font-bold text-xl mb-3 text-slate-800">3. 數據化評估報告</h3>
          <p className="text-slate-400 text-sm leading-relaxed">AI 生成詳細的理賠金額預估、溝通技巧建議與理賠要點分析報告。</p>
        </div>
      </div>
    </div>
  );
};

export default Home;
