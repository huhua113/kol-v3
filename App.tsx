import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Download, CheckCircle2, Zap } from 'lucide-react';

import { Kol, Visit, ViewTab } from './types';
import { LoginView } from './components/views/LoginView';
import { DashboardView } from './components/views/DashboardView';
import { KolListView } from './components/views/KolListView';
import { KolDetailView } from './components/views/KolDetailView';
import { CompetitorView } from './components/views/CompetitorView';
import { AddKolModal } from './components/modals/AddKolModal';
import { VisitModal } from './components/modals/VisitModal';
import BottomNav from './components/ui/BottomNav';

const STORAGE_KEYS = {
  KOLS: 'ckm_pro_kols_v2',
  VISITS: 'ckm_pro_visits_v2'
};

const MemoizedKolListView = React.memo(KolListView);
const MemoizedDashboardView = React.memo(DashboardView);
const MemoizedCompetitorView = React.memo(CompetitorView);

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
  
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.KOLS, JSON.stringify(kols));
  }, [kols]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.VISITS, JSON.stringify(visits));
  }, [visits]);

  const selectedKol = useMemo(() => kols.find(k => k.id === selectedKolId) || null, [kols, selectedKolId]);
  const modalKol = useMemo(() => kols.find(k => k.id === (quickRecordKolId || selectedKolId)) || null, [kols, quickRecordKolId, selectedKolId]);

  const triggerToast = useCallback((msg: string) => {
    setSuccessToast({ show: true, msg });
    setTimeout(() => setSuccessToast({ show: false, msg: '' }), 3000);
  }, []);

  const handleLogin = () => {
    if (passcode === '1234') setAuth(true);
    else alert('邀请码错误');
  };

  const handleAddKols = useCallback((importText: string) => {
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
    setShowAddModal(false);
    triggerToast(`成功导入 ${newKols.length} 位专家`);
  }, [triggerToast]);

  const handleBatchUpdateLevel = useCallback((ids: string[], level: number) => {
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
  }, [triggerToast]);

  const handleBatchDeleteKols = useCallback((ids: string[]) => {
    if (!window.confirm(`确定要永久删除选中的 ${ids.length} 位专家及其所有访谈记录吗？`)) return;
    
    setKols(prev => prev.filter(k => !ids.includes(k.id)));
    setVisits(prev => prev.filter(v => !ids.includes(v.kolId)));
    triggerToast(`已成功移除 ${ids.length} 位专家数据`);
  }, [triggerToast]);

  const handleSaveVisit = useCallback((visitData: Omit<Visit, 'id' | 'kolId' | 'timestamp'>) => {
    if (!modalKol) return;

    const newVisit: Visit = {
      id: `v_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      kolId: modalKol.id,
      ...visitData,
      timestamp: Date.now()
    };
    
    setVisits(prev => [newVisit, ...prev]);
    setKols(prev => prev.map(k => k.id === modalKol.id ? { ...k, level: Number(newVisit.level) } : k));
    
    setShowVisitModal(false);
    setQuickRecordKolId(null);
    triggerToast('访谈记录已保存');
  }, [modalKol, triggerToast]);

  const handleQuickRecordVisit = useCallback((kol: Kol) => {
    setQuickRecordKolId(kol.id);
    setShowVisitModal(true);
  }, []);

  const handleDeleteVisit = useCallback((id: string, type?: 'competitor' | 'efficacy' | 'safety') => {
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
  }, [triggerToast]);

  const exportToExcel = useCallback(() => {
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
  }, [kols, visits]);

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
          <MemoizedKolListView 
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
        {activeTab === 'dashboard' && <MemoizedDashboardView kols={kols} visits={visits} setActiveTab={setActiveTab} />}
        {activeTab === 'competitors' && <MemoizedCompetitorView kols={kols} visits={visits} onDeleteVisit={handleDeleteVisit} />}
      </main>

      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />

      {showAddModal && (
        <AddKolModal 
          onClose={() => setShowAddModal(false)}
          onImport={handleAddKols}
        />
      )}

      {showVisitModal && (
        <VisitModal 
          kol={modalKol}
          onClose={() => {setShowVisitModal(false); setQuickRecordKolId(null);}}
          onSave={handleSaveVisit}
        />
      )}
    </div>
  );
}