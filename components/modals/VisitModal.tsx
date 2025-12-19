import React, { useState, useEffect } from 'react';
import { Sparkles, CheckCircle2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { Kol, Visit } from '../../types';
import { LEVELS, PRODUCTS, DISEASE_AREAS } from '../../constants';

interface VisitModalProps {
  kol: Kol | null;
  onClose: () => void;
  onSave: (visit: Omit<Visit, 'id' | 'kolId' | 'timestamp'>) => void;
}

const INITIAL_STATE = {
  date: new Date().toISOString().split('T')[0],
  content: '',
  level: 3,
  competitor: '',
  products: [] as string[],
  diseaseAreas: [] as string[],
  efficacyInfo: '',
  safetyInfo: ''
};

export const VisitModal: React.FC<VisitModalProps> = ({ kol, onClose, onSave }) => {
  const [newVisit, setNewVisit] = useState(INITIAL_STATE);

  useEffect(() => {
    // 当选中的专家变化时，重置表单并设置其当前level
    if (kol) {
      setNewVisit(prev => ({ ...INITIAL_STATE, level: kol.level }));
    }
  }, [kol]);

  if (!kol) return null;

  const handleSave = () => {
    onSave({ ...newVisit, level: Number(newVisit.level) });
  };

  const toggleMultiSelect = (field: 'products' | 'diseaseAreas', value: string) => {
    setNewVisit(prev => {
      const current = prev[field];
      const next = current.includes(value) ? current.filter(v => v !== value) : [...current, value];
      return { ...prev, [field]: next };
    });
  };

  return (
    <div className="fixed inset-0 bg-brand-text/20 backdrop-blur-md z-[150] flex items-end justify-center">
      <div className="w-full max-w-sm bg-brand-bg rounded-t-[2.5rem] animate-slide-up p-7 overflow-y-auto max-h-[92vh] shadow-2xl border-t border-blue-100">
        <div className="w-10 h-1 bg-brand-border/60 rounded-full mx-auto mb-6"></div>
        <h3 className="font-bold text-xl mb-6 flex items-center gap-3 text-brand-text">
          <div className="p-2.5 bg-blue-50 rounded-xl text-brand-primary"><Sparkles size={22} /></div>
          访谈记录 <span className="text-sm font-medium text-brand-subtext">for {kol.name}</span>
        </h3>
        <div className="space-y-6 pb-6">
          <section>
            <label className="text-[10px] font-black text-brand-subtext uppercase tracking-widest mb-2 block">访谈日期</label>
            <input type="date" className="w-full bg-white px-4 py-3.5 rounded-xl border border-brand-border text-sm font-bold text-brand-text outline-none focus:ring-2 focus:ring-brand-primary/10" value={newVisit.date} onChange={e => setNewVisit({...newVisit, date: e.target.value})} />
          </section>

          <section>
            <label className="text-[10px] font-black text-brand-subtext uppercase tracking-widest mb-2 block">核心产品</label>
            <div className="flex flex-wrap gap-2">
              {PRODUCTS.map(p => (
                <button key={p} onClick={() => toggleMultiSelect('products', p)} 
                  className={`px-3 py-2 text-xs font-bold rounded-lg transition-all ${newVisit.products.includes(p) ? 'bg-brand-primary text-white shadow-sm' : 'bg-white text-brand-subtext border border-brand-border'}`}>{p}</button>
              ))}
            </div>
          </section>

          <section>
            <label className="text-[10px] font-black text-brand-subtext uppercase tracking-widest mb-2 block">目前针对心肝肾综合获益认知阶段</label>
            <div className="grid grid-cols-1 gap-2.5">
              {LEVELS.map(l => ( 
                <button key={l.id} onClick={() => setNewVisit({...newVisit, level: l.id})} 
                  className={`p-3 rounded-xl text-left transition-all flex justify-between items-center ${newVisit.level === l.id ? 'bg-brand-primary text-white shadow-soft ring-2 ring-white/50' : 'bg-white text-brand-subtext border border-brand-border hover:border-brand-primary'}`}>
                  <span className="font-bold text-sm">{l.label}</span>
                  {newVisit.level === l.id && <CheckCircle2 size={18} />}
                </button> 
              ))}
            </div>
          </section>
          
          <section>
            <label className="text-[10px] font-black text-brand-subtext uppercase tracking-widest mb-2 block">疾病领域</label>
            <div className="flex flex-wrap gap-2">
              {DISEASE_AREAS.map(p => (
                <button key={p} onClick={() => toggleMultiSelect('diseaseAreas', p)} 
                  className={`px-3 py-2 text-xs font-bold rounded-lg transition-all ${newVisit.diseaseAreas.includes(p) ? 'bg-brand-secondary text-white shadow-sm' : 'bg-white text-brand-subtext border border-brand-border'}`}>{p}</button>
              ))}
            </div>
          </section>

          <section>
            <label className="text-[10px] font-black text-brand-subtext uppercase tracking-widest mb-2 block">核心内容</label>
            <textarea className="w-full bg-white p-4 rounded-xl border border-brand-border text-sm h-28 outline-none focus:ring-2 focus:ring-brand-primary/10 resize-none font-bold text-brand-text" placeholder="记录本次访谈的核心沟通内容..." value={newVisit.content} onChange={e => setNewVisit({...newVisit, content: e.target.value})} />
          </section>
          
          <section>
            <label className="text-[10px] font-black text-brand-subtext uppercase tracking-widest mb-2 block">疗效价值信息</label>
            <textarea className="w-full bg-white p-4 rounded-xl border border-brand-border text-sm h-24 outline-none focus:ring-2 focus:ring-brand-primary/10 resize-none font-bold text-brand-text" placeholder="记录专家对产品疗效、优势等方面的反馈..." value={newVisit.efficacyInfo} onChange={e => setNewVisit({...newVisit, efficacyInfo: e.target.value})} />
          </section>

          <section>
            <label className="text-[10px] font-black text-brand-subtext uppercase tracking-widest mb-2 block">安全性价值信息</label>
            <textarea className="w-full bg-white p-4 rounded-xl border border-brand-border text-sm h-24 outline-none focus:ring-2 focus:ring-brand-primary/10 resize-none font-bold text-brand-text" placeholder="记录专家对产品安全性、副作用等方面的反馈..." value={newVisit.safetyInfo} onChange={e => setNewVisit({...newVisit, safetyInfo: e.target.value})} />
          </section>

          <section>
            <label className="text-[10px] font-black text-brand-subtext uppercase tracking-widest mb-2 block">竞品动态</label>
            <textarea className="w-full bg-white p-4 rounded-xl border border-brand-border text-sm h-24 outline-none focus:ring-2 focus:ring-brand-primary/10 resize-none font-bold text-brand-text" placeholder="记录竞品相关的市场活动、专家反馈等..." value={newVisit.competitor || ''} onChange={e => setNewVisit({...newVisit, competitor: e.target.value})} />
          </section>

          <div className="flex gap-3 pt-2">
            <Button variant="ghost" onClick={onClose} className="flex-1">取消</Button>
            <Button onClick={handleSave} className="flex-[2]">完成记录</Button>
          </div>
        </div>
      </div>
    </div>
  );
};
