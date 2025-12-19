import React, { useState, useEffect, useMemo } from 'react';
import { BarChart3, Users, FileText, Sparkles, Download, CheckCircle2, Zap } from 'lucide-react';

import { Kol, Visit, ViewTab } from './types';
import { LEVELS, PRODUCTS, DISEASE_AREAS } from './constants';

import { Card } from './components/ui/Card';
import { Button } from './components/ui/Button';
import { LoginView } from './components/views/LoginView';
import { DashboardView } from './components/views/DashboardView';
import { KolListView } from './components/views/KolListView';
import { KolDetailView } from './components/views/KolDetailView';
import { CompetitorView } from './components/views/CompetitorView';

const STORAGE_KEYS = {
  KOLS: 'ckm_pro_kols_v2',
  VISITS: 'ckm_pro_visits_v2'
};

export default function App() {
  const [auth, setAuth] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [activeTab, setActiveTab] = useState<ViewTab>('list');
  const [successToast, setSuccessToast] = useState<{show: boolean, msg: string}>({show: false, msg: ''});
  
  const [kols, setKols] = useState<Kol[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.KOLS);
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error("Failed to parse kols from localStorage", error);
      return [];
    }
  });

  const [visits, setVisits] = useState<Visit[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.VISITS);
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error("Failed to parse visits from localStorage", error);
      return [];
    }
  });

  const [selectedKolId, setSelectedKolId] = useState<string | null>(null);
  const [quickRecordKolId, setQuickRecordKolId] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'level-desc' | 'level-asc' | 'name-asc'>('level-desc');
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [showVisitModal, setShowVisitModal] = useState(false);
  
  const [importText, setImportText] = useState('');
  const [newVisit, setNewVisit] = useState({ 
    date: new Date().toISOString().split('T')[0], 
    content: '', 
    level: 3, 
    competitor: '',
    products: [] as string[],
    diseaseAreas: [] as string[],
    efficacyInfo: '',
    safetyInfo: ''
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.KOLS, JSON.stringify(kols));
  }, [kols]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.VISITS, JSON.stringify(visits));
  }, [visits]);

  const selectedKol = useMemo(() => kols.find(k => k.id === selectedKolId) || null, [kols, selectedKolId]);
  const modalKol = useMemo(() => kols.find(k => k.id === (quickRecordKolId || selectedKolId)) || null, [kols, quickRecordKolId, selectedKolId]);

  const triggerToast = (msg: string) => {
    setSuccessToast({ show: true, msg });
    setTimeout(() => setSuccessToast({ show: false, msg: '' }), 3000);
  };

  const handleLogin = () => {
    if (passcode === '1234') setAuth(true);
    else alert('邀请码错误');
  };

  const handleImport = () => {
    const lines = importText.split('\n').filter(line => line.trim() !== '');
    if (lines.length === 0) return;

    const newKols: Kol[] = lines.map((line) => {
      const parts = line.trim().split(/[\t\s]+/);
      const name = parts[0] || '未知姓名';
      let hospital = '未知医院', dept = '未知科室';
      if (parts.length === 3) { hospital = parts[1]; dept = parts[2]; } 
      else if (parts.length === 2) { dept = parts[1]; }
      
      return {
        id: `kol_${Date.now()}_${Math.random().toString(36).substr(2, 9)}_${name}`,
        name,
        hospital,
        dept,
        level: 3
      };
    }).filter(k => k.name && k.name !== '未知姓名');
    
    setKols(prev => [...prev, ...newKols]);
    setImportText('');
    setShowAddModal(false);
    triggerToast(`成功导入 ${newKols.length} 位专家`);
  };

  const handleBatchUpdateLevel = (ids: string[], level: number) => {
    const newVisits: Visit[] = [];
    const dateStr = new Date().toISOString().split('T')[0];
    
    setKols(prevKols => prevKols.map(k => {
      if (ids.includes(k.id)) {
        newVisits.push({
          id: `v_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          kolId: k.id,
          date: dateStr,
          content: `批量修改观念等级至 S${level}`,
          level,
          products: [],
          diseaseAreas: [],
          efficacyInfo: '',
          safetyInfo: '',
          competitor: null,
          timestamp: Date.now()
        });
        return { ...k, level };
      }
      return k;
    }));
    
    setVisits(prevVisits => [...prevVisits, ...newVisits]);
    triggerToast(`成功批量更新 ${ids.length} 位专家`);
  };

  const handleBatchDeleteKols = (ids: string[]) => {
    if (!window.confirm(`确定要永久删除选中的 ${ids.length} 位专家及其所有访谈记录吗？`)) return;
    
    setKols(prev => prev.filter(k => !ids.includes(k.id)));
    setVisits(prev => prev.filter(v => !ids.includes(v.kolId)));
    triggerToast(`已成功移除 ${ids.length} 位专家数据`);
  };

  const addVisit = () => {
    if (!modalKol) return;
    const visitData: Visit = {
      id: `v_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      kolId: modalKol.id,
      ...newVisit,
      level: Number(newVisit.level),
      timestamp: Date.now()
    };
    
    setVisits(prev => [visitData, ...prev]);
    setKols(prev => prev.map(k => k.id === modalKol.id ? { ...k, level: Number(newVisit.level) } : k));
    
    setShowVisitModal(false);
    setQuickRecordKolId(null);
    resetForm();
    triggerToast('访谈记录已保存');
  };

  const handleQuickRecordVisit = (kol: Kol) => {
    setQuickRecordKolId(kol.id);
    resetForm();
    setNewVisit(prev => ({ ...prev, level: kol.level }));
    setShowVisitModal(true);
  };

  const handleDeleteVisit = (id: string, type?: 'competitor' | 'efficacy' | 'safety') => {
    if (type) {
      setVisits(prevVisits => prevVisits.map(visit => {
        if (visit.id === id) {
          const updatedVisit = { ...visit };
          if (type === 'competitor') updatedVisit.competitor = null;
          else if (type === 'efficacy') updatedVisit.efficacyInfo = "";
          else if (type === 'safety') updatedVisit.safetyInfo = "";
          return updatedVisit;
        }
        return visit;
      }));
      triggerToast('情报条目已移除');
    } else {
      if (window.confirm('您确定要永久删除此条访谈记录吗？')) {
        setVisits(prev => prev.filter(v => v.id !== id));
        triggerToast('访谈记录已移除');
      }
    }
  };

  const resetForm = () => {
    setNewVisit({ date: new Date().toISOString().split('T')[0], content: '', level: 3, competitor: '', products: [], diseaseAreas: [], efficacyInfo: '', safetyInfo: '' });
  };

  const toggleMultiSelect = (field: 'products' | 'diseaseAreas', value: string) => {
    setNewVisit(prev => {
      const current = prev[field];
      const next = current.includes(value) ? current.filter(v => v !== value) : [...current, value];
      return { ...prev, [field]: next };
    });
  };

  const exportToExcel = () => {
    const headers = ["日期", "专家姓名", "医院", "科室", "观念层级", "产品", "疾病领域", "拜访内容", "疗效价值信息", "安全性价值信息", "竞品动态"];
    const rows = visits.map(v => {
      const k = kols.find(kol => kol.id === v.kolId);
      return [v.date, k?.name || "已删除", k?.hospital || "", k?.dept || "", `S${v.level}`, (v.products || []).join(", "), (v.diseaseAreas || []).join(", "), v.content.replace(/"/g, '""'), v.efficacyInfo.replace(/"/g, '""'), v.safetyInfo.replace(/"/g, '""'), (v.competitor || "").replace(/"/g, '""')];
    });
    const csvContent = "\uFEFF" + [headers, ...rows].map(r => r.map(cell => `"${cell}"`).join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", `CKM_Data.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!auth) return <LoginView passcode={passcode} setPasscode={setPasscode} onLogin={handleLogin} />;

  return (
    <div className="max-w-sm mx-auto min-h-screen bg-brand-bg relative overflow-hidden flex flex-col font-sans">
      {successToast.show && (
        <div className="fixed top-8 left-1/2 z-[200] animate-toast-in -translate-x-1/2 w-auto max-w-[80%]">
           <div className="flex items-center gap-2.5 px-6 py-3.5 rounded-full bg-brand-primary text-white font-semibold shadow-soft border border-blue-400">
              <CheckCircle2 size={18} className="shrink-0" />
              <span className="text-sm whitespace-nowrap">{successToast.msg}</span>
           </div>
        </div>
      )}

      {selectedKol && !showVisitModal && (
        <KolDetailView 
          kol={selectedKol} 
          visits={visits} 
          onBack={() => setSelectedKolId(null)} 
          onDeleteVisit={handleDeleteVisit} 
          onRecordVisit={() => setShowVisitModal(true)} 
        />
      )}

      <header className="px-6 pt-10 pb-5 flex justify-between items-center bg-brand-bg">
          <div className="animate-fade-in">
            <h1 className="text-2xl font-extrabold text-brand-text flex items-center gap-2">
              <Zap size={24} className="text-brand-primary" fill="currentColor" />
              CKM Studio
            </h1>
          </div>
          <div className="flex gap-2">
            <button onClick={exportToExcel} className="w-11 h-11 bg-white rounded-2xl flex items-center justify-center text-brand-primary shadow-sm border border-brand-border active:scale-90 transition-all">
              <Download size={20} />
            </button>
          </div>
      </header>

      <main className="flex-1 overflow-y-auto px-4 pb-28 scrollbar-hide">
        {activeTab === 'list' && (
          <KolListView 
            kols={kols} 
            onSelectKol={(k) => setSelectedKolId(k.id)} 
            onAddClick={() => setShowAddModal(true)} 
            onQuickRecord={handleQuickRecordVisit}
            onBatchUpdateLevel={handleBatchUpdateLevel}
            onBatchDeleteKols={handleBatchDeleteKols}
            sortOrder={sortOrder} 
            setSortOrder={setSortOrder} 
          />
        )}
        {activeTab === 'dashboard' && <DashboardView kols={kols} visits={visits} setActiveTab={setActiveTab} />}
        {activeTab === 'competitors' && <CompetitorView kols={kols} visits={visits} onDeleteVisit={handleDeleteVisit} />}
      </main>

      <nav className="bg-white/95 backdrop-blur-xl border-t border-brand-border h-24 flex items-center justify-around fixed bottom-0 max-w-sm w-full z-40 px-6 rounded-t-[2.5rem] shadow-[0_-8px_30px_rgb(0,0,0,0.04)]">
        {[ 
          {id: 'list', icon: Users, label: '专家'}, 
          {id: 'dashboard', icon: BarChart3, label: '概览'}, 
          {id: 'competitors', icon: FileText, label: '详情'} 
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} 
            className={`flex flex-col items-center justify-center gap-1 transition-all duration-300 ${activeTab === tab.id ? 'text-brand-primary' : 'text-brand-subtext/50'}`}>
            <div className={`p-3 rounded-2xl transition-all ${activeTab === tab.id ? 'bg-blue-50' : ''}`}>
              <tab.icon size={22} strokeWidth={activeTab === tab.id ? 2.5 : 2} />
            </div>
            <span className="text-[10px] font-bold tracking-tight">{tab.label}</span>
          </button>
        ))}
      </nav>

      {showAddModal && (
        <div className="fixed inset-0 bg-brand-text/20 backdrop-blur-sm z-[150] flex items-center justify-center p-6">
          <Card className="w-full max-w-sm animate-scale-in">
            <h3 className="font-bold text-lg mb-4 text-brand-text">批量导入专家</h3>
            <div className="bg-brand-light rounded-xl p-4 mb-5 border border-brand-border">
              <textarea className="w-full h-36 bg-transparent border-none text-sm focus:outline-none resize-none font-bold text-brand-text" placeholder={`韩晓东 上海市交通大学医学院附属第六人民医院 外科\n吴江 华东医院 营养科`} value={importText} onChange={e => setImportText(e.target.value)} />
            </div>
            <div className="flex gap-3">
              <Button variant="ghost" onClick={() => setShowAddModal(false)} className="flex-1">取消</Button>
              <Button onClick={handleImport} className="flex-1">开始导入</Button>
            </div>
          </Card>
        </div>
      )}

      {showVisitModal && (
        <div className="fixed inset-0 bg-brand-text/20 backdrop-blur-md z-[150] flex items-end justify-center">
          <div className="w-full max-w-sm bg-brand-bg rounded-t-[2.5rem] animate-slide-up p-7 overflow-y-auto max-h-[92vh] shadow-2xl border-t border-blue-100">
            <div className="w-10 h-1 bg-brand-border/60 rounded-full mx-auto mb-6"></div>
            <h3 className="font-bold text-xl mb-6 flex items-center gap-3 text-brand-text">
              <div className="p-2.5 bg-blue-50 rounded-xl text-brand-primary"><Sparkles size={22} /></div>
              访谈记录 <span className="text-sm font-medium text-brand-subtext">for {modalKol?.name}</span>
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
                <Button variant="ghost" onClick={() => {setShowVisitModal(false); setQuickRecordKolId(null);}} className="flex-1">取消</Button>
                <Button onClick={addVisit} className="flex-[2]">完成记录</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}