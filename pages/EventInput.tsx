
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MedicalEvent } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

const INCIDENT_TYPES = [
  { zh: '疾病 (住院/門診)', en: 'Disease (Inpatient/Outpatient)' },
  { zh: '意外傷害 (挫傷/骨折等)', en: 'Accident (Injury/Fracture)' },
  { zh: '癌症相關 (確診/治療)', en: 'Cancer (Diagnosis/Treatment)' },
  { zh: '壽險事故 (失能/死亡)', en: 'Life (Disability/Death)' },
  { zh: '重大疾病 (中風/心梗等)', en: 'Critical Illness (Stroke, etc.)' },
  { zh: '長期照顧/失能扶助', en: 'Long-term Care' },
  { zh: '其他 (自行輸入)', en: 'Other (Enter manually)' }
];

const TREATMENT_METHODS = [
  { zh: '一般門診 (不含手術)', en: 'General Outpatient' },
  { zh: '門診手術 (不需住院)', en: 'Outpatient Surgery' },
  { zh: '住院手術', en: 'Inpatient Surgery' },
  { zh: '癌症化學/放射線治療', en: 'Chemotherapy/Radiotherapy' },
  { zh: '重大處置 (如血液透析)', en: 'Major Treatment (Dialysis)' },
  { zh: '物理復健/職能治療', en: 'Rehabilitation' },
  { zh: '其他 (自行輸入)', en: 'Other (Enter manually)' }
];

const EventInput: React.FC = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [evidenceFiles, setEvidenceFiles] = useState<string[]>([]);
  
  const [incidentType, setIncidentType] = useState('');
  const [customIncidentType, setCustomIncidentType] = useState('');
  
  const [treatmentMethod, setTreatmentMethod] = useState('');
  const [customTreatmentMethod, setCustomTreatmentMethod] = useState('');

  const otherLabel = t('event.other');

  useEffect(() => {
    const currentUser = localStorage.getItem('claimestimate_current_user');
    if (!currentUser) {
      navigate('/login');
    }
  }, [navigate]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setEvidenceFiles(prev => [...prev, event.target?.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeFile = (index: number) => {
    setEvidenceFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    
    // Check if user selected "Other" (localized)
    const isIncidentOther = incidentType === otherLabel || INCIDENT_TYPES.find(i => (language === 'zh-TW' ? i.zh : i.en) === incidentType)?.en.includes('Other');
    const isTreatmentOther = treatmentMethod === otherLabel || TREATMENT_METHODS.find(t => (language === 'zh-TW' ? t.zh : t.en) === treatmentMethod)?.en.includes('Other');

    const finalIncidentType = isIncidentOther ? customIncidentType : incidentType;
    const finalTreatmentMethod = isTreatmentOther ? customTreatmentMethod : treatmentMethod;

    const eventData: MedicalEvent = {
      diagnosis: `[${finalIncidentType}] ${formData.get('diagnosis')}`,
      hospitalizationDays: Number(formData.get('hospitalizationDays')),
      surgeryName: `[${finalTreatmentMethod}] ${formData.get('surgeryName') || 'N/A'}`,
      outpatientVisits: Number(formData.get('outpatientVisits')),
      totalExpense: Number(formData.get('totalExpense')),
      retainedAmount: Number(formData.get('retainedAmount') || 0), 
      incidentDate: formData.get('incidentDate') as string,
      evidenceFiles: evidenceFiles
    };

    localStorage.setItem('claimestimate_current_event', JSON.stringify(eventData));
    
    setTimeout(() => {
      navigate('/estimate');
    }, 1200);
  };

  const isPdf = (dataUrl: string) => dataUrl.startsWith('data:application/pdf');

  return (
    <div className="max-w-3xl mx-auto space-y-10 animate-fadeIn pb-12">
      <div className="text-center">
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">{t('event.title')}</h2>
        <p className="text-slate-500 mt-2 font-medium">{t('event.desc')}</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-100 space-y-8">
        
        <div className="md:col-span-2">
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">{t('event.type.label')}</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {INCIDENT_TYPES.map(type => {
              const label = language === 'zh-TW' ? type.zh : type.en;
              return (
                <button
                  key={type.en}
                  type="button"
                  onClick={() => setIncidentType(label)}
                  className={`px-4 py-3 rounded-2xl text-xs font-bold border transition-all ${
                    incidentType === label 
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100' 
                      : 'bg-slate-50 border-slate-100 text-slate-600 hover:border-indigo-200'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
          {(incidentType === otherLabel || incidentType.includes('Other') || incidentType.includes('其他')) && (
            <input 
              required
              value={customIncidentType}
              onChange={e => setCustomIncidentType(e.target.value)}
              placeholder={t('event.type.ph')}
              className="mt-3 w-full px-5 py-3 bg-indigo-50 border border-indigo-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold animate-fadeIn"
            />
          )}
          <input type="hidden" required name="incident_type" value={incidentType} />
        </div>

        <div className="md:col-span-2 space-y-4">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">{t('event.treatment.label')}</label>
            <select 
              required
              value={treatmentMethod}
              onChange={e => setTreatmentMethod(e.target.value)}
              className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold"
            >
              <option value="">{t('event.treatment.ph.select')}</option>
              {TREATMENT_METHODS.map(m => {
                 const label = language === 'zh-TW' ? m.zh : m.en;
                 return <option key={m.en} value={label}>{label}</option>
              })}
            </select>
            {(treatmentMethod === otherLabel || treatmentMethod.includes('Other') || treatmentMethod.includes('其他')) && (
              <input 
                required
                value={customTreatmentMethod}
                onChange={e => setCustomTreatmentMethod(e.target.value)}
                placeholder={t('event.treatment.customPh')} 
                className="mt-3 w-full px-5 py-3 bg-indigo-50 border border-indigo-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold animate-fadeIn"
              />
            )}
          </div>
          <input 
            required 
            name="diagnosis" 
            placeholder={t('event.diagnosis.ph')}
            className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold" 
          />
        </div>

        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">{t('event.date')}</label>
          <input required name="incidentDate" type="date" className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">{t('event.days')}</label>
            <input required name="hospitalizationDays" type="number" min="0" defaultValue="0" className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold" />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">{t('event.visits')}</label>
            <input required name="outpatientVisits" type="number" min="0" defaultValue="0" className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold" />
          </div>
        </div>

        <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100 space-y-6">
           <h4 className="text-sm font-black text-slate-700 flex items-center gap-2">
             <i className="fas fa-coins text-indigo-600"></i> {t('event.financials.title')}
           </h4>
           
           <div className="md:col-span-2">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{t('event.expense.label')} <span className="text-rose-500">*</span></label>
            <p className="text-xs text-slate-400 mb-2">{t('event.expense.desc')}</p>
            <div className="relative">
              <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 font-mono font-bold">$</span>
              <input required name="totalExpense" type="number" placeholder="0" className="w-full pl-12 pr-6 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-mono font-bold text-xl text-indigo-600" />
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{t('event.retained.label')} <span className="text-slate-300 font-medium normal-case">{t('event.retained.optional')}</span></label>
            <p className="text-xs text-slate-400 mb-2">{t('event.retained.desc')}</p>
            <div className="relative">
              <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 font-mono font-bold">$</span>
              <input name="retainedAmount" type="number" placeholder="0" className="w-full pl-12 pr-6 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-slate-400 outline-none font-mono font-bold text-lg text-slate-600" />
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-50">
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2 justify-between">
            <div className="flex items-center gap-2">
              <i className="fas fa-file-signature text-indigo-500"></i> {t('event.files.label')}
            </div>
            <span className="text-[10px] text-slate-400 font-normal normal-case border border-slate-200 px-2 py-1 rounded-lg bg-slate-50">{t('event.files.note')}</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {evidenceFiles.map((file, idx) => (
              <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden shadow-sm group bg-slate-50 border border-slate-100 flex items-center justify-center">
                {isPdf(file) ? (
                    <div className="flex flex-col items-center text-rose-500">
                        <i className="fas fa-file-pdf text-4xl mb-2"></i>
                        <span className="text-[10px] font-bold">PDF</span>
                    </div>
                ) : (
                    <img src={file} className="w-full h-full object-cover" alt="preview" />
                )}
                
                <button type="button" onClick={() => removeFile(idx)} className="absolute top-2 right-2 bg-slate-900/60 text-white w-7 h-7 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  <i className="fas fa-trash-can text-xs"></i>
                </button>
              </div>
            ))}
            <label className="aspect-square border-2 border-dashed border-slate-100 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-indigo-50/50 hover:border-indigo-200 transition-all text-slate-300">
              <i className="fas fa-plus text-xl mb-1"></i>
              <span className="text-[10px] font-black uppercase tracking-widest">ADD</span>
              <input type="file" multiple accept="application/pdf,image/jpeg,image/png,image/webp" onChange={handleFileChange} className="hidden" />
            </label>
          </div>
        </div>

        <button 
          type="submit" 
          disabled={isSubmitting || !incidentType}
          className={`w-full py-5 rounded-[1.5rem] font-black text-xl shadow-2xl transition-all flex items-center justify-center gap-3 ${
            isSubmitting || !incidentType ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-100 active:scale-95'
          }`}
        >
          {isSubmitting ? <><i className="fas fa-spinner fa-spin"></i> {t('event.btn.submitting')}</> : <><i className="fas fa-bolt"></i> {t('event.btn.submit')}</>}
        </button>
      </form>
    </div>
  );
};

export default EventInput;
