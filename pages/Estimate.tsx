
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Policy, MedicalEvent, EstimationResult } from '../types';
import { estimateClaims } from '../services/geminiService';
import { useLanguage } from '../contexts/LanguageContext';

const Estimate: React.FC = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<EstimationResult | null>(null);
  const [eventData, setEventData] = useState<MedicalEvent | null>(null);

  useEffect(() => {
    const currentUser = localStorage.getItem('claimestimate_current_user');
    if (!currentUser) {
      navigate('/login');
      return;
    }
    const user = JSON.parse(currentUser);

    const runEstimation = async () => {
      const savedPolicies = localStorage.getItem(`claimestimate_policies_${user.id}`);
      const savedEvent = localStorage.getItem('claimestimate_current_event');

      if (!savedPolicies || !savedEvent) {
        setError(language === 'zh-TW' ? '請先建立保單並填寫事故資料。' : 'Please create policies and incident data first.');
        setLoading(false);
        return;
      }

      const policies: Policy[] = JSON.parse(savedPolicies);
      const event: MedicalEvent = JSON.parse(savedEvent);
      setEventData(event);
      
      if (policies.length === 0) {
        setError(language === 'zh-TW' ? '您的保單庫是空的，無法進行試算。' : 'Your policy library is empty.');
        setLoading(false);
        return;
      }

      try {
        const estimation = await estimateClaims(policies, event, language);
        // Force at least an empty object structure if estimation returns null somehow
        setResult(estimation || { 
            summary: "", 
            totalEstimatedAmount: 0, 
            items: [], 
            evaluationPoints: [], 
            communicationAdvice: [] 
        });
      } catch (err: any) {
        console.error(err);
        setError(err.message || (language === 'zh-TW' ? '估算過程中發生錯誤。' : 'Error during estimation.'));
      } finally {
        setLoading(false);
      }
    };

    runEstimation();
  }, [navigate, language]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-12 animate-pulse">
        <div className="relative">
          <div className="w-28 h-28 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <i className="fas fa-sparkles text-indigo-600 text-3xl"></i>
          </div>
        </div>
        <div className="text-center space-y-3">
          <h3 className="text-3xl font-black text-slate-900 tracking-tight">{t('estimate.loading.title')}</h3>
          <p className="text-slate-400 font-medium max-w-sm mx-auto">{t('estimate.loading.desc')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-6">
         <div className="w-20 h-20 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-500">
            <i className="fas fa-triangle-exclamation text-3xl"></i>
         </div>
         <div className="text-center">
             <h3 className="text-xl font-black text-slate-900 mb-2">{t('estimate.error.title')}</h3>
             <p className="text-slate-500">{error}</p>
         </div>
         <button onClick={() => navigate('/policies')} className="text-indigo-600 font-bold hover:underline">
            {t('estimate.back')}
         </button>
      </div>
    );
  }

  const adviceTypeStyles = {
    strategy: { bg: 'bg-emerald-50', text: 'text-emerald-800', icon: 'fa-comments', labelKey: 'estimate.advice.strategy' },
    warning: { bg: 'bg-rose-50', text: 'text-rose-800', icon: 'fa-shield-halved', labelKey: 'estimate.advice.warning' },
    tip: { bg: 'bg-indigo-50', text: 'text-indigo-800', icon: 'fa-lightbulb', labelKey: 'estimate.advice.tip' },
  };

  return (
    <div className="space-y-12 animate-fadeIn max-w-5xl mx-auto pb-24">
      <div className="bg-white rounded-[3rem] p-12 shadow-2xl shadow-slate-200/50 border border-slate-100 flex flex-col lg:flex-row gap-12 items-center">
        <div className="flex-1 space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black tracking-widest uppercase">
            {t('estimate.result.badge')}
          </div>
          <h2 className="text-5xl font-black text-slate-900 leading-[1.1]">
            {t('estimate.result.total')} <br/>
            {/* Added fallback to 0 and toLocaleString() */}
            <span className="text-indigo-600 font-mono text-6xl drop-shadow-sm">NT$ {(result?.totalEstimatedAmount || 0).toLocaleString()}</span>
          </h2>
          <p className="text-slate-500 text-lg font-medium leading-relaxed italic">
            「{result?.summary || '...' }」
          </p>
        </div>
        <div className="w-full lg:w-80 space-y-4">
          <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100">
            <h4 className="text-[10px] font-black text-slate-400 uppercase mb-4 tracking-widest">{t('estimate.summary.title')}</h4>
            <div className="space-y-3 text-sm font-bold text-slate-700">
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">{t('estimate.summary.diagnosis')}</span>
                <span className="text-right">{eventData?.diagnosis ? eventData.diagnosis.split('] ')[1] : eventData?.diagnosis}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">{t('estimate.summary.expense')}</span>
                <span className="font-mono text-indigo-600">${eventData?.totalExpense?.toLocaleString() || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-7 space-y-8">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">{t('estimate.list.title')}</h3>
          </div>
          <div className="space-y-5">
            {/* Added safe check for empty items array */}
            {(!result?.items || result.items.length === 0) && (
                <div className="text-center py-10 text-slate-400 font-medium bg-slate-50 rounded-[2rem]">
                    {language === 'zh-TW' ? '暫無符合的理賠項目' : 'No applicable coverage found.'}
                </div>
            )}
            {(result?.items || []).map((item, idx) => (
              <div key={idx} className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 group transition-all hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-50/50">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`w-2 h-2 rounded-full ${item.status === 'APPLICABLE' ? 'bg-emerald-500' : item.status === 'POTENTIAL' ? 'bg-amber-500' : 'bg-slate-300'}`}></span>
                      <h4 className="font-black text-slate-900 text-xl tracking-tight">{item.componentName}</h4>
                    </div>
                    <p className="text-sm text-slate-400 font-medium leading-relaxed">{item.reason}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-2xl font-mono font-black ${item.estimatedAmount > 0 ? 'text-emerald-600' : 'text-slate-300'}`}>
                      {item.estimatedAmount > 0 ? `+ ${item.estimatedAmount.toLocaleString()}` : '-'}
                    </p>
                    <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest mt-2 block ${
                      item.status === 'APPLICABLE' ? 'bg-emerald-50 text-emerald-600' : 
                      item.status === 'POTENTIAL' ? 'bg-amber-50 text-amber-600' : 'bg-slate-50 text-slate-400'
                    }`}>
                      {t(`estimate.status.${item.status}`)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-5 space-y-10">
          <section className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <i className="fas fa-file-shield text-8xl"></i>
            </div>
            <h3 className="text-xl font-black mb-8 flex items-center gap-3 relative">
              <i className="fas fa-microscope text-indigo-400"></i> {t('estimate.points.title')}
            </h3>
            <ul className="space-y-6 relative">
              {(result?.evaluationPoints || []).map((point, idx) => (
                <li key={idx} className="flex gap-4 text-sm text-slate-300 leading-relaxed group">
                  <span className="w-6 h-6 rounded-xl bg-indigo-500/20 flex items-center justify-center shrink-0 text-xs font-black text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-all">{idx+1}</span>
                  {point}
                </li>
              ))}
              {(!result?.evaluationPoints || result.evaluationPoints.length === 0) && (
                  <li className="text-slate-500 text-sm italic">{language === 'zh-TW' ? '無特別注意事項' : 'No key points.'}</li>
              )}
            </ul>
          </section>

          <section className="space-y-6">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <i className="fas fa-comments text-indigo-600"></i> {t('estimate.advice.title')}
            </h3>
            <div className="space-y-5">
              {(result?.communicationAdvice || []).map((advice, idx) => {
                const style = adviceTypeStyles[advice.type as keyof typeof adviceTypeStyles] || adviceTypeStyles.tip;
                return (
                  <div key={idx} className={`${style.bg} rounded-[2rem] p-8 border border-white shadow-sm hover:shadow-md transition-all`}>
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`w-10 h-10 rounded-2xl ${style.text} bg-white flex items-center justify-center shadow-sm`}>
                        <i className={`fas ${style.icon} text-lg`}></i>
                      </div>
                      <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${style.text}`}>{t(style.labelKey)}</span>
                    </div>
                    <h5 className={`font-black text-lg ${style.text} mb-2 tracking-tight`}>{advice.title}</h5>
                    <p className={`text-sm ${style.text} opacity-70 leading-relaxed font-medium`}>{advice.content}</p>
                  </div>
                );
              })}
              {(!result?.communicationAdvice || result.communicationAdvice.length === 0) && (
                  <div className="p-6 bg-slate-50 rounded-2xl text-slate-400 text-sm text-center">
                    {language === 'zh-TW' ? '暫無建議' : 'No advice available.'}
                  </div>
              )}
            </div>
          </section>

          <div className="pt-8">
            <button 
              onClick={() => window.print()} 
              className="w-full py-5 bg-slate-900 text-white rounded-[1.5rem] font-black shadow-xl hover:bg-slate-800 transition-all active:scale-95 flex items-center justify-center gap-3"
            >
              <i className="fas fa-file-pdf"></i> {t('estimate.btn.print')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Estimate;
