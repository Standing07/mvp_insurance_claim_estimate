
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Policy } from '../types';
import { extractPolicyFromImage } from '../services/geminiService';
import { useLanguage } from '../contexts/LanguageContext';

const COMPANIES = [
  '國泰人壽 (Cathay Life)', '富邦人壽 (Fubon Life)', '南山人壽 (Nan Shan Life)',
  '新光人壽 (Shin Kong Life)', '凱基人壽 (KGI Life)', '台灣人壽 (Taiwan Life)',
  '三商美邦人壽 (Mercuries)', '全球人壽 (TransGlobe)', '遠雄人壽 (Farglory)',
  '元大人壽 (Yuanta)', '宏泰人壽 (Hontai)', '安聯人壽 (Allianz)',
  '保誠人壽 (Prudential)', '友邦人壽 (AIA)', '法國巴黎人壽 (Cardif)',
  '安達人壽 (Chubb)', '第一金人壽 (First Life)', '合作金庫人壽 (BNP)',
  '臺銀人壽 (BankTaiwan)', '中華郵政壽險 (Post)', '其他 (Other)'
];

const PLAN_CATEGORIES = [
  { zh: '壽險 (終身/定期)', en: 'Life Insurance' },
  { zh: '住院醫療 (實支實付)', en: 'Medical (Reimbursement)' },
  { zh: '住院醫療 (日額型)', en: 'Medical (Daily)' },
  { zh: '重大疾病/特定傷病', en: 'Critical Illness' },
  { zh: '癌症醫療 (一次給付)', en: 'Cancer (Lump Sum)' },
  { zh: '癌症醫療 (住院/化療)', en: 'Cancer (Treatment)' },
  { zh: '意外傷害 (死殘/醫療)', en: 'Accident' },
  { zh: '失能扶助/長期照顧', en: 'Disability/Long-term Care' },
  { zh: '投資型保單', en: 'Investment-Linked' },
  { zh: '年金保險', en: 'Annuity' },
  { zh: '不確定/其他', en: 'Unknown/Other' }
];

const Policies: React.FC = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  
  const [riderModalPolicyId, setRiderModalPolicyId] = useState<string | null>(null);
  const [riderForm, setRiderForm] = useState({ name: '', category: '', amount: '' });
  const [userInfo, setUserInfo] = useState({ name: '', dob: '' });
  const [form, setForm] = useState({ company: '', mainPlanName: '', mainPlanCategory: '', mainCoverageAmount: '' });
  
  useEffect(() => {
    const currentUser = localStorage.getItem('claimestimate_current_user');
    if (!currentUser) {
      navigate('/login');
      return;
    }
    const user = JSON.parse(currentUser);
    setUserId(user.id);

    const savedKey = `claimestimate_policies_${user.id}`;
    const savedUserKey = `claimestimate_user_info_${user.id}`;
    const saved = localStorage.getItem(savedKey);
    const savedInfo = localStorage.getItem(savedUserKey);

    if (saved) setPolicies(JSON.parse(saved));
    if (savedInfo) setUserInfo(JSON.parse(savedInfo));
  }, [navigate]);

  const saveToStorage = (updated: Policy[]) => {
    if (!userId) return;
    setPolicies(updated);
    localStorage.setItem(`claimestimate_policies_${userId}`, JSON.stringify(updated));
  };

  const saveUserToStorage = (info: { name: string, dob: string }) => {
    if (!userId) return;
    setUserInfo(info);
    localStorage.setItem(`claimestimate_user_info_${userId}`, JSON.stringify(info));
  };

  const handleScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      try {
        const extracted = await extractPolicyFromImage(base64, language);
        setForm({
          company: extracted.company || '',
          mainPlanName: extracted.mainPlanName || '',
          mainPlanCategory: '',
          mainCoverageAmount: extracted.mainCoverageAmount?.toString() || ''
        });
        alert(t('policies.scan.success'));
      } catch (err) {
        console.error(err);
        alert(t('policies.scan.error'));
      } finally {
        setIsScanning(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const addPolicy = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const newPolicy: Policy = {
      id: crypto.randomUUID(),
      company: form.company,
      mainPlanName: form.mainPlanName,
      mainPlanCategory: form.mainPlanCategory,
      mainCoverageAmount: Number(form.mainCoverageAmount),
      riders: []
    };
    saveToStorage([...policies, newPolicy]);
    setShowAddModal(false);
    setForm({ company: '', mainPlanName: '', mainPlanCategory: '', mainCoverageAmount: '' });
  };

  const submitRider = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!riderModalPolicyId) return;

    const amount = Number(riderForm.amount);
    if (!riderForm.name || isNaN(amount)) return;

    const updated = policies.map(p => {
      if (p.id === riderModalPolicyId) {
        return {
          ...p,
          riders: [...p.riders, { 
            id: crypto.randomUUID(), 
            name: riderForm.name, 
            category: riderForm.category,
            coverageAmount: amount, 
            description: riderForm.category || '' 
          }]
        };
      }
      return p;
    });
    saveToStorage(updated);
    setRiderModalPolicyId(null);
    setRiderForm({ name: '', category: '', amount: '' });
  };

  const getCategoryLabel = (val: string) => {
    const found = PLAN_CATEGORIES.find(c => c.zh === val || c.en === val);
    if (found) return language === 'zh-TW' ? found.zh : found.en;
    return val;
  };

  if (!userId) return null;

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
        <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
          <i className="fas fa-user-circle text-indigo-600"></i> {t('policies.userInfo.title')}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">{t('policies.label.name')}</label>
            <input 
              value={userInfo.name}
              onChange={e => saveUserToStorage({...userInfo, name: e.target.value})}
              placeholder={t('policies.ph.name')} 
              className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">{t('policies.label.dob')}</label>
            <input 
              type="date"
              value={userInfo.dob}
              onChange={e => saveUserToStorage({...userInfo, dob: e.target.value})}
              className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800">{t('policies.title')}</h2>
          <p className="text-slate-500 text-sm">{t('policies.subtitle')}</p>
        </div>
        <div className="flex gap-2">
          <label className="cursor-pointer bg-indigo-50 text-indigo-700 px-5 py-3 rounded-2xl text-sm font-black flex items-center gap-2 border border-indigo-100 hover:bg-indigo-100 transition-all">
            <div className="flex flex-col items-start text-left">
              <div className="flex items-center gap-2">
                <i className="fas fa-file-invoice"></i> 
                <span>{t('policies.btn.scan')}</span>
              </div>
            </div>
            <input 
              type="file" 
              className="hidden" 
              accept="application/pdf,image/jpeg,image/png,image/webp" 
              onChange={(e) => {
                handleScan(e);
                setShowAddModal(true);
              }} 
            />
          </label>
          <button 
            onClick={() => { setShowAddModal(true); }}
            className="bg-slate-900 text-white px-5 py-3 rounded-2xl text-sm font-black hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
          >
            <i className="fas fa-plus"></i> {t('policies.btn.manual')}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {policies.length === 0 ? (
          <div className="py-20 text-center bg-white rounded-[2.5rem] border-2 border-dashed border-slate-100">
            <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-slate-200">
              <i className="fas fa-file-contract text-3xl"></i>
            </div>
            <p className="text-slate-400 font-bold">{t('policies.empty')}</p>
          </div>
        ) : (
          policies.map(policy => (
            <div key={policy.id} className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 flex flex-col hover:border-indigo-200 transition-all group relative">
              <button 
                onClick={() => { if(confirm(t('policies.alert.delete'))) saveToStorage(policies.filter(p => p.id !== policy.id)) }}
                className="absolute top-6 right-6 text-slate-200 hover:text-rose-500 p-2 transition-colors"
              >
                <i className="fas fa-xmark"></i>
              </button>
              <div className="mb-6">
                <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full uppercase tracking-widest">{policy.company}</span>
                <div className="flex items-baseline gap-2 mt-2">
                  <h3 className="text-2xl font-black text-slate-800">{policy.mainPlanName}</h3>
                  {policy.mainPlanCategory && <span className="text-xs text-slate-400 font-medium">({getCategoryLabel(policy.mainPlanCategory)})</span>}
                </div>
                <p className="text-slate-400 text-sm font-medium mt-1">{t('policies.mainCoverage')}：<span className="text-slate-800 font-mono">${policy.mainCoverageAmount.toLocaleString()}</span></p>
              </div>

              <div className="space-y-3 pl-4 border-l-2 border-slate-50">
                <h4 className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-2">{t('policies.riders')}</h4>
                {policy.riders.map(rider => (
                  <div key={rider.id} className="bg-slate-50 p-4 rounded-2xl flex justify-between items-center group/rider">
                    <div>
                      <p className="text-sm font-bold text-slate-700">{rider.name}</p>
                      {rider.category && <span className="text-[10px] font-bold text-slate-400">{getCategoryLabel(rider.category)}</span>}
                    </div>
                    <span className="text-sm font-mono font-bold text-slate-500">${rider.coverageAmount.toLocaleString()}</span>
                  </div>
                ))}
                <button 
                  onClick={() => {
                    setRiderModalPolicyId(policy.id);
                    setRiderForm({ name: '', category: '', amount: '' });
                  }}
                  className="w-full py-3 border border-dashed border-slate-200 rounded-2xl text-slate-400 text-xs font-black uppercase hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50 transition-all flex items-center justify-center gap-2"
                >
                  <i className="fas fa-plus"></i> {t('policies.btnAddRider')}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ACTION BUTTONS: This section was missing in your local file */}
      <div className="flex flex-col sm:flex-row gap-4 mt-8 pt-8 border-t border-slate-100">
        <button
          onClick={() => alert(t('policies.msg.saved'))}
          className="flex-1 py-4 rounded-2xl border-2 border-slate-200 font-black text-slate-500 hover:border-slate-300 hover:bg-slate-50 transition-all"
        >
          <i className="fas fa-floppy-disk mr-2"></i>
          {t('policies.btn.save')}
        </button>
        <button
          onClick={() => navigate('/event')}
          className="flex-[2] py-4 rounded-2xl bg-indigo-600 text-white font-black shadow-xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-3"
        >
          {t('policies.btn.next')} <i className="fas fa-arrow-right"></i>
        </button>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] p-10 w-full max-w-lg shadow-2xl animate-scaleIn overflow-y-auto max-h-[90vh]">
            <h3 className="text-2xl font-black mb-2 text-slate-900">{t('policies.modal.title')}</h3>
            <p className="text-slate-400 text-sm mb-8 font-medium">{t('policies.modal.desc')}</p>
            
            {isScanning && (
              <div className="mb-8 p-5 bg-indigo-600 rounded-2xl flex items-center gap-4 text-white shadow-lg shadow-indigo-100">
                <i className="fas fa-spinner fa-spin text-xl"></i>
                <span className="font-bold tracking-tight">{t('policies.scan.loading')}</span>
              </div>
            )}

            <form onSubmit={addPolicy} className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{t('policies.modal.company')}</label>
                <select 
                  required 
                  value={form.company} 
                  onChange={e => setForm({...form, company: e.target.value})}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none appearance-none font-bold text-slate-700"
                >
                  <option value="">{t('policies.modal.ph.company')}</option>
                  {COMPANIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{t('policies.modal.plan')}</label>
                <input 
                  required 
                  value={form.mainPlanName} 
                  onChange={e => setForm({...form, mainPlanName: e.target.value})}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-700"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{t('policies.modal.category')}</label>
                <select 
                  value={form.mainPlanCategory} 
                  onChange={e => setForm({...form, mainPlanCategory: e.target.value})}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none appearance-none font-bold text-slate-700"
                >
                  <option value="">{t('policies.modal.ph.category')}</option>
                  {PLAN_CATEGORIES.map(p => (
                    <option key={p.en} value={language === 'zh-TW' ? p.zh : p.en}>
                       {language === 'zh-TW' ? p.zh : p.en}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{t('policies.modal.amount')}</label>
                <input 
                  required 
                  type="number" 
                  value={form.mainCoverageAmount} 
                  onChange={e => setForm({...form, mainCoverageAmount: e.target.value})}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-700"
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-4 text-slate-400 font-black">Cancel</button>
                <button type="submit" className="flex-2 bg-indigo-600 text-white font-black py-4 px-8 rounded-2xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all">{t('policies.modal.save')}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {riderModalPolicyId && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[110] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] p-10 w-full max-w-md shadow-2xl animate-scaleIn">
            <h3 className="text-xl font-black mb-6 text-slate-900">{t('policies.riderModal.title')}</h3>
            <form onSubmit={submitRider} className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{t('policies.riderModal.name')}</label>
                <input 
                  required 
                  value={riderForm.name} 
                  onChange={e => setRiderForm({...riderForm, name: e.target.value})}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-700"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{t('policies.riderModal.category')}</label>
                <select 
                  value={riderForm.category} 
                  onChange={e => setRiderForm({...riderForm, category: e.target.value})}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none appearance-none font-bold text-slate-700"
                >
                  <option value="">{t('policies.modal.ph.category')}</option>
                  {PLAN_CATEGORIES.map(p => (
                    <option key={p.en} value={language === 'zh-TW' ? p.zh : p.en}>
                       {language === 'zh-TW' ? p.zh : p.en}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{t('policies.riderModal.amount')}</label>
                <input 
                  required 
                  type="number" 
                  value={riderForm.amount} 
                  onChange={e => setRiderForm({...riderForm, amount: e.target.value})}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-700"
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setRiderModalPolicyId(null)} className="flex-1 py-4 text-slate-400 font-black">Cancel</button>
                <button type="submit" className="flex-2 bg-indigo-600 text-white font-black py-4 px-8 rounded-2xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all">{t('policies.riderModal.title')}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Policies;
