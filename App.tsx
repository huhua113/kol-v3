import React, { useState, useEffect } from 'react';
import { BarChart3, Users, FileText, Sparkles, Layers } from 'lucide-react';

import { Kol, Visit, ViewTab } from './types';
import { INITIAL_SURGERY, INITIAL_NUTRITION, LEVELS } from './constants';

import { Card } from './components/ui/Card';
import { Button } from './components/ui/Button';

import { LoginView } from './components/views/LoginView';
import { DashboardView } from './components/views/DashboardView';
import { KolListView } from './components/views/KolListView';
import { KolDetailView } from './components/views/KolDetailView';
import { CompetitorView } from './components/views/CompetitorView';

export default function App() {
  // State
  const [auth, setAuth] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [activeTab, setActiveTab] = useState<ViewTab>('list'); // Default to list (Experts)
  
  const [kols, setKols] = useState<Kol[]>([]);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [selectedKol, setSelectedKol] = useState<Kol | null>(null);
  const [sortOrder, setSortOrder] = useState<'level-desc' | 'level-asc' | 'name-asc'>('level-desc');
  
  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showVisitModal, setShowVisitModal] = useState(false);
  
  // Batch Mode State
  const [isBatchMode, setIsBatchMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showBatchModal, setShowBatchModal] = useState(false);

  // Temporary state for forms
  const [importText, setImportText] = useState('');
  const [newVisit, setNewVisit] = useState({ 
    date: new Date().toISOString().split('T')[0], 
    content: '', 
    level: 3, 
    competitor: '' 
  });

  // --- Initialization & Effects ---

  useEffect(() => {
    const savedKols = localStorage.getItem('ckm_kols');
    const savedVisits = localStorage.getItem('ckm_visits');
    
    if (savedKols) {
      setKols(JSON.parse(savedKols));
    } else {
      // Initialize with default data
      const initKols: Kol[] = [
        ...INITIAL_SURGERY.map((n, i) => ({ id: `s_${i}`, name: n, dept: '代谢外科', level: 3 })),
        ...INITIAL_NUTRITION.map((n, i) => ({ id: `n_${i}`, name: n, dept: '营养科', level: 3 }))
      ];
      setKols(initKols);
      localStorage.setItem('ckm_kols', JSON.stringify(initKols));
    }

    if (savedVisits) setVisits(JSON.parse(savedVisits));
  }, []);

  useEffect(() => {
    if (kols.length > 0) localStorage.setItem('ckm_kols', JSON.stringify(kols));
    localStorage.setItem('ckm_visits', JSON.stringify(visits));
  }, [kols, visits]);

  // --- Logic Functions ---

  const handleLogin = () => {
    if (passcode === '1234') setAuth(true);
    else alert('邀请码错误');
  };

  const handleImport = () => {
    const lines = importText.split('\n');
    const newKols = lines.map((line, idx) => {
      // Try to split by tab or space
      const parts = line.split(/[\t\s]+/);
      if (parts.length < 1) return null;
      const name = parts[0];
      const dept = parts.length > 1 ? parts[1] : '未知科室';
      if (!name) return null;
      return {
        id: Date.now() + '_' + idx,
        name,
        dept,
        level: 3 // Default S3
      };
    }).filter((k): k is Kol => k !== null);

    setKols([...kols, ...newKols]);
    setImportText('');
    setShowAddModal(false);
  };

  const addVisit = () => {
    if (!selectedKol) return;
    
    const visitEntry: Visit = {
      id: Date.now(),
      kolId: selectedKol.id,
      date: newVisit.date,
      content: newVisit.content,
      level: Number(newVisit.level),
      competitor: newVisit.competitor || null,
      timestamp: Date.now()
    };

    // Update Visits
    const updatedVisits = [...visits, visitEntry];
    setVisits(updatedVisits);

    // Update KOL Current Level
    const updatedKols = kols.map(k => 
      k.id === selectedKol.id ? { ...k, level: Number(newVisit.level) } : k
    );
    setKols(updatedKols);
    
    // Update local selected state to reflect change immediately
    setSelectedKol({ ...selectedKol, level: Number(newVisit.level) });

    setShowVisitModal(false);
    setNewVisit({ date: new Date().toISOString().split('T')[0], content: '', level: 3, competitor: '' });
  };

  // --- Batch Logic ---

  const toggleBatchMode = () => {
      setIsBatchMode(!isBatchMode);
      setSelectedIds(new Set()); // Clear selection on toggle
  };

  const toggleSelection = (id: string) => {
      const newSet = new Set(selectedIds);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      setSelectedIds(newSet);
  };

  const handleBatchUpdate = () => {
     if (selectedIds.size === 0) return;

     const timestamp = Date.now();
     const level = Number(newVisit.level);
     const date = newVisit.date;
     const content = newVisit.content || '批量更新';
     const competitor = newVisit.competitor || null;

     // 1. Create visit records for all selected KOLs
     const batchVisits: Visit[] = Array.from(selectedIds).map((kolId: string, index: number) => ({
        id: timestamp + index,
        kolId,
        date,
        content,
        level,
        competitor,
        timestamp: timestamp
     }));

     setVisits([...visits, ...batchVisits]);

     // 2. Update KOL levels
     const updatedKols = kols.map(k => {
         if (selectedIds.has(k.id)) {
             return { ...k, level };
         }
         return k;
     });
     setKols(updatedKols);

     // 3. Cleanup
     setIsBatchMode(false);
     setSelectedIds(new Set());
     setShowBatchModal(false);
     setNewVisit({ date: new Date().toISOString().split('T')[0], content: '', level: 3, competitor: '' });
  };
  
  const handleBatchDelete = () => {
    if (selectedIds.size === 0) return;
    if (window.confirm(`您确定要删除选中的 ${selectedIds.size} 位专家吗？此操作将同时删除他们的所有拜访记录，且无法恢复。`)) {
      // 1. Filter out deleted kols
      const updatedKols = kols.filter(k => !selectedIds.has(k.id));
      setKols(updatedKols);

      // 2. Filter out visits of deleted kols
      const updatedVisits = visits.filter(v => !selectedIds.has(v.kolId));
      setVisits(updatedVisits);

      // 3. Cleanup
      setIsBatchMode(false);
      setSelectedIds(new Set());
    }
  };

  const deleteVisit = (visitId: number) => {
    if (!window.confirm("确定删除这条记录吗？专家观念将回滚到上一条记录的状态。")) return;

    // 0. Find the visit to get kolId (needed if called from competitor view)
    const visitToDelete = visits.find(v => v.id === visitId);
    if (!visitToDelete) return;
    const kolId = visitToDelete.kolId;

    // 1. Remove the visit
    const remainingVisits = visits.filter(v => v.id !== visitId);
    setVisits(remainingVisits);

    // 2. Find history for this KOL to determine rollback level
    const kolHistory = remainingVisits
      .filter(v => v.kolId === kolId)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime() || a.timestamp - b.timestamp);

    // 3. Determine new level
    let newLevel = 3; // Default
    if (kolHistory.length > 0) {
      newLevel = kolHistory[kolHistory.length - 1].level;
    }

    // 4. Update KOL
    const updatedKols = kols.map(k => 
      k.id === kolId ? { ...k, level: newLevel } : k
    );
    setKols(updatedKols);
    
    if (selectedKol && selectedKol.id === kolId) {
      setSelectedKol({ ...selectedKol, level: newLevel });
    }
  };

  // --- Render ---

  if (!auth) return <LoginView passcode={passcode} setPasscode={setPasscode} onLogin={handleLogin} />;

  return (
    <div className="max-w-sm mx-auto min-h-screen bg-brand-bg text-brand-text relative overflow-hidden shadow-2xl border-x border-brand-border">
      
      {/* Detail Overlay */}
      {selectedKol && (
        <KolDetailView 
          kol={selectedKol} 
          visits={visits} 
          onBack={() => setSelectedKol(null)}
          onDeleteVisit={deleteVisit}
          onRecordVisit={() => setShowVisitModal(true)}
        />
      )}

      {/* Main Layout */}
      <div className="flex flex-col h-screen">
        {/* Header */}
        <header className="px-6 pt-10 pb-2 bg-white/80 backdrop-blur-sm sticky top-0 z-10 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-secondary flex items-center gap-2">
                <Sparkles size={24} className="text-brand-primary" fill="currentColor" />
                CKM Manager
              </h1>
              <p className="text-xs font-bold text-brand-subtext uppercase tracking-widest mt-1 ml-1">Professional Edition</p>
            </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-4 pb-24 scrollbar-hide">
          {activeTab === 'list' && (
             <KolListView 
               kols={kols} 
               onSelectKol={setSelectedKol} 
               onAddClick={() => setShowAddModal(true)}
               isBatchMode={isBatchMode}
               toggleBatchMode={toggleBatchMode}
               selectedIds={selectedIds}
               toggleSelection={toggleSelection}
               onOpenBatchModal={() => setShowBatchModal(true)}
               onBatchDelete={handleBatchDelete}
               sortOrder={sortOrder}
               setSortOrder={setSortOrder}
             />
          )}
          {activeTab === 'dashboard' && <DashboardView kols={kols} visits={visits} setActiveTab={setActiveTab} />}
          {activeTab === 'competitors' && (
            <CompetitorView 
              kols={kols} 
              visits={visits} 
              onDeleteVisit={deleteVisit} 
            />
          )}
        </main>

        {/* Bottom Nav */}
        <nav className="bg-white/90 backdrop-blur-md border-t border-brand-border h-16 flex items-center justify-around absolute bottom-0 w-full z-10 shadow-[0_-5px_15px_rgba(0,0,0,0.02)]">
          <button 
             onClick={() => setActiveTab('list')}
             className={`flex flex-col items-center p-2 rounded-xl transition-all duration-300 ${activeTab === 'list' ? 'text-brand-secondary scale-110' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <Users size={24} strokeWidth={activeTab === 'list' ? 2.5 : 2} />
            <span className="text-[10px] mt-1 font-bold">专家</span>
          </button>
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`flex flex-col items-center p-2 rounded-xl transition-all duration-300 ${activeTab === 'dashboard' ? 'text-brand-primary scale-110' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <BarChart3 size={24} strokeWidth={activeTab === 'dashboard' ? 2.5 : 2} />
            <span className="text-[10px] mt-1 font-bold">概览</span>
          </button>
          <button 
             onClick={() => setActiveTab('competitors')}
             className={`flex flex-col items-center p-2 rounded-xl transition-all duration-300 ${activeTab === 'competitors' ? 'text-brand-accent scale-110' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <FileText size={24} strokeWidth={activeTab === 'competitors' ? 2.5 : 2} />
            <span className="text-[10px] mt-1 font-bold">竞品</span>
          </button>
        </nav>
      </div>

      {/* Modals */}
      
      {/* Add KOL Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-brand-text/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-sm animate-scale-in border-none shadow-2xl">
            <h3 className="font-bold text-lg mb-4 text-brand-text">批量导入专家</h3>
            <p className="text-xs text-brand-subtext mb-3">直接粘贴Excel (姓名 [空格/Tab] 科室)</p>
            <textarea 
              className="w-full h-32 p-3 border border-brand-border rounded-xl text-sm mb-4 focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary focus:outline-none transition-all"
              placeholder={`例如：\n韩晓东 代谢外科\n吴江 营养科`}
              value={importText}
              onChange={e => setImportText(e.target.value)}
            />
            <div className="flex gap-3">
              <Button variant="ghost" onClick={() => setShowAddModal(false)} className="flex-1 bg-brand-light">取消</Button>
              <Button onClick={handleImport} className="flex-1 shadow-lg shadow-brand-primary/30">导入 (默认S3)</Button>
            </div>
          </Card>
        </div>
      )}

      {/* Add Visit Modal (Single) */}
      {showVisitModal && (
        <div className="fixed inset-0 bg-brand-text/20 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center sm:p-4">
          <Card className="w-full max-w-sm rounded-b-none sm:rounded-2xl animate-slide-up p-6 border-none shadow-2xl">
            <div className="w-12 h-1.5 bg-brand-border rounded-full mx-auto mb-6 sm:hidden"></div>
            <h3 className="font-bold text-xl mb-5 text-brand-text flex items-center gap-2">
                <Sparkles size={20} className="text-brand-primary" />
                记录拜访
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-brand-subtext uppercase tracking-wide mb-1.5 block">日期</label>
                <input 
                  type="date" 
                  className="w-full p-3 border border-brand-border rounded-xl focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary focus:outline-none transition-all"
                  value={newVisit.date}
                  onChange={e => setNewVisit({...newVisit, date: e.target.value})}
                />
              </div>

              <div>
                <label className="text-xs font-bold text-brand-subtext uppercase tracking-wide mb-2 block">拜访后观念层级</label>
                <div className="grid grid-cols-5 gap-2">
                  {[1,2,3,4,5].map(l => (
                    <button
                      key={l}
                      onClick={() => setNewVisit({...newVisit, level: l})}
                      className={`p-2.5 rounded-xl text-sm font-bold border transition-all ${
                        newVisit.level === l 
                        ? 'bg-brand-primary text-white border-brand-primary shadow-lg shadow-brand-primary/30 scale-105' 
                        : 'bg-brand-light text-brand-subtext border-transparent hover:bg-white hover:border-brand-border'
                      }`}
                    >
                      S{l}
                    </button>
                  ))}
                </div>
                <div className="text-center text-sm text-brand-primary mt-2 font-bold bg-indigo-50 py-1 rounded-lg">
                  {LEVELS.find(l => l.id === newVisit.level)?.label}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-brand-subtext uppercase tracking-wide mb-1.5 block">沟通内容</label>
                <textarea 
                  className="w-full p-3 border border-brand-border rounded-xl h-24 focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary focus:outline-none transition-all"
                  placeholder="主要聊了什么..."
                  value={newVisit.content}
                  onChange={e => setNewVisit({...newVisit, content: e.target.value})}
                />
              </div>

              <div>
                <label className="text-xs font-bold text-brand-accent uppercase tracking-wide mb-1.5 block">竞品信息 (选填)</label>
                <input 
                  className="w-full p-3 border border-rose-100 rounded-xl bg-rose-50/50 focus:bg-white focus:ring-2 focus:ring-rose-200 focus:border-rose-300 focus:outline-none transition-all placeholder:text-rose-300"
                  placeholder="专家提到的竞品动态..."
                  value={newVisit.competitor}
                  onChange={e => setNewVisit({...newVisit, competitor: e.target.value})}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button variant="ghost" onClick={() => setShowVisitModal(false)} className="flex-1 bg-brand-light">取消</Button>
                <Button onClick={addVisit} className="flex-1 shadow-xl shadow-brand-primary/30">保存记录</Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Batch Update Modal */}
      {showBatchModal && (
        <div className="fixed inset-0 bg-brand-text/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center sm:p-4">
          <Card className="w-full max-w-sm rounded-b-none sm:rounded-2xl animate-slide-up p-6 border-none shadow-2xl">
            <div className="w-12 h-1.5 bg-brand-border rounded-full mx-auto mb-6 sm:hidden"></div>
            <h3 className="font-bold text-xl mb-5 text-brand-text flex items-center gap-2">
                <Layers size={20} className="text-brand-text" />
                批量更新专家 ({selectedIds.size})
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-brand-subtext uppercase tracking-wide mb-1.5 block">日期</label>
                <input 
                  type="date" 
                  className="w-full p-3 border border-brand-border rounded-xl focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary focus:outline-none transition-all"
                  value={newVisit.date}
                  onChange={e => setNewVisit({...newVisit, date: e.target.value})}
                />
              </div>

              <div>
                <label className="text-xs font-bold text-brand-subtext uppercase tracking-wide mb-2 block">新观念层级</label>
                <div className="grid grid-cols-5 gap-2">
                  {[1,2,3,4,5].map(l => (
                    <button
                      key={l}
                      onClick={() => setNewVisit({...newVisit, level: l})}
                      className={`p-2.5 rounded-xl text-sm font-bold border transition-all ${
                        newVisit.level === l 
                        ? 'bg-brand-text text-white border-brand-text shadow-lg scale-105' 
                        : 'bg-brand-light text-brand-subtext border-transparent hover:bg-white hover:border-brand-border'
                      }`}
                    >
                      S{l}
                    </button>
                  ))}
                </div>
                <div className="text-center text-sm text-brand-text mt-2 font-bold bg-gray-100 py-1 rounded-lg">
                  {LEVELS.find(l => l.id === newVisit.level)?.label}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-brand-subtext uppercase tracking-wide mb-1.5 block">批量备注</label>
                <textarea 
                  className="w-full p-3 border border-brand-border rounded-xl h-24 focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary focus:outline-none transition-all"
                  placeholder="例如：学术会议统一拜访..."
                  value={newVisit.content}
                  onChange={e => setNewVisit({...newVisit, content: e.target.value})}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button variant="ghost" onClick={() => setShowBatchModal(false)} className="flex-1 bg-brand-light">取消</Button>
                <Button onClick={handleBatchUpdate} className="flex-1 bg-brand-text hover:bg-black shadow-xl">确认批量更新</Button>
              </div>
            </div>
          </Card>
        </div>
      )}

    </div>
  );
}
