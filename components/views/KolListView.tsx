import React, { useState, useMemo } from 'react';
import { Search, Plus, ChevronRight, User, MapPin, ChevronDown, PenLine, CheckSquare, Square, Check, X, Trash2 } from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Kol } from '../../types';

interface KolListViewProps {
  kols: Kol[];
  onSelectKol: (kol: Kol) => void;
  onAddClick: () => void;
  onQuickRecord: (kol: Kol) => void;
  onBatchUpdateLevel: (ids: string[], level: number) => void;
  onBatchDeleteKols: (ids: string[]) => void;
  sortOrder: 'level-desc' | 'level-asc' | 'name-asc';
  setSortOrder: (order: 'level-desc' | 'level-asc' | 'name-asc') => void;
}

export const KolListView: React.FC<KolListViewProps> = ({ 
  kols, 
  onSelectKol, 
  onAddClick,
  onQuickRecord,
  onBatchUpdateLevel,
  onBatchDeleteKols,
  sortOrder,
  setSortOrder,
}) => {
  const [search, setSearch] = useState('');
  const [isSortMenuOpen, setIsSortMenuOpen] = useState(false);
  
  // 批量模式状态
  const [isBatchMode, setIsBatchMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showLevelPicker, setShowLevelPicker] = useState(false);

  const filteredKols = kols.filter(k => 
    k.name.toLowerCase().includes(search.toLowerCase()) || 
    k.dept.toLowerCase().includes(search.toLowerCase()) ||
    k.hospital.toLowerCase().includes(search.toLowerCase())
  );

  const sortedKols = useMemo(() => {
    return [...filteredKols].sort((a, b) => {
      if (sortOrder === 'level-desc') return b.level - a.level;
      if (sortOrder === 'level-asc') return a.level - b.level;
      if (sortOrder === 'name-asc') return a.name.localeCompare(b.name, 'zh-Hans-CN');
      return 0;
    });
  }, [filteredKols, sortOrder]);

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const selectAll = () => {
    if (selectedIds.size === sortedKols.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(sortedKols.map(k => k.id)));
    }
  };

  const handleBatchUpdate = (level: number) => {
    onBatchUpdateLevel(Array.from(selectedIds), level);
    setIsBatchMode(false);
    setSelectedIds(new Set());
    setShowLevelPicker(false);
  };

  const handleBatchDelete = () => {
    if (selectedIds.size === 0) return;
    onBatchDeleteKols(Array.from(selectedIds));
    setIsBatchMode(false);
    setSelectedIds(new Set());
  };

  const sortOptions: Record<typeof sortOrder, string> = {
    'level-desc': '阶段降序',
    'level-asc': '阶段升序',
    'name-asc': '姓名排序',
  };

  const getAvatarBg = (name: string) => {
    const colors = ['bg-blue-500', 'bg-indigo-500', 'bg-sky-500', 'bg-blue-600', 'bg-cyan-600'];
    return colors[name.charCodeAt(0) % colors.length];
  };

  return (
    <div className="space-y-5 animate-fade-in pb-20">
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-subtext">
             <Search size={18} />
          </div>
          <input 
            className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-white border border-brand-border/60 shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/30 transition-all text-sm font-bold text-brand-text placeholder:text-brand-subtext/70"
            placeholder="搜索姓名 / 科室 / 医院"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        
        {!isBatchMode && (
          <button onClick={onAddClick} className="w-12 h-12 bg-brand-primary text-white rounded-2xl flex items-center justify-center shadow-soft active:scale-95 transition-all">
            <Plus size={24} />
          </button>
        )}
      </div>

      <div className="flex justify-between items-center px-1">
        <div className="flex items-center gap-3">
          <div className="text-[11px] font-black text-brand-subtext flex items-center gap-1.5 uppercase tracking-wide">
             <User size={12} className="text-brand-primary" />
             {filteredKols.length} 位在库专家
          </div>
          <button 
            onClick={() => {
              setIsBatchMode(!isBatchMode);
              setSelectedIds(new Set());
            }}
            className={`text-[10px] font-bold px-2.5 py-1 rounded-lg transition-all ${isBatchMode ? 'bg-brand-accent text-white' : 'bg-brand-light text-brand-subtext border border-brand-border'}`}
          >
            {isBatchMode ? '退出批量' : '批量操作'}
          </button>
        </div>
        
        <div className="relative">
          <button onClick={() => setIsSortMenuOpen(!isSortMenuOpen)} className="flex items-center gap-2 text-[11px] font-bold text-brand-primary bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-100 transition-all active:scale-95">
            {sortOptions[sortOrder]}
            <ChevronDown size={14} className={`transition-transform duration-300 ${isSortMenuOpen ? 'rotate-180' : ''}`} />
          </button>
          
          {isSortMenuOpen && (
            <div className="absolute top-full right-0 mt-2 w-36 bg-white rounded-2xl shadow-xl border border-brand-border/30 z-50 p-1.5 animate-scale-in">
              {Object.entries(sortOptions).map(([key, value]) => (
                <button
                  key={key}
                  onClick={() => { setSortOrder(key as any); setIsSortMenuOpen(false); }}
                  className={`w-full text-left px-3 py-2.5 text-xs rounded-xl font-semibold transition-colors ${sortOrder === key ? 'bg-brand-primary text-white' : 'text-brand-subtext hover:bg-brand-light'}`}
                >
                  {value}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {isBatchMode && (
        <button 
          onClick={selectAll}
          className="w-full flex items-center justify-center gap-2 py-2 bg-white rounded-xl border border-brand-border text-[11px] font-bold text-brand-primary shadow-sm active:bg-blue-50"
        >
          {selectedIds.size === sortedKols.length ? <CheckSquare size={14} /> : <Square size={14} />}
          {selectedIds.size === sortedKols.length ? '取消全选' : '全选当前结果'}
        </button>
      )}

      <div className="space-y-3">
        {sortedKols.map(kol => (
          <div key={kol.id} className="relative group">
            <Card className={`transition-all p-4 ${isBatchMode && selectedIds.has(kol.id) ? 'ring-2 ring-brand-primary border-transparent' : ''}`}>
              <div 
                onClick={() => isBatchMode ? toggleSelect(kol.id) : onSelectKol(kol)} 
                className="flex items-center gap-3 cursor-pointer"
              >
                {isBatchMode && (
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${selectedIds.has(kol.id) ? 'bg-brand-primary border-brand-primary text-white' : 'border-brand-border bg-brand-light'}`}>
                    {selectedIds.has(kol.id) && <Check size={14} strokeWidth={3} />}
                  </div>
                )}

                <div className={`w-12 h-12 rounded-xl ${getAvatarBg(kol.name)} flex items-center justify-center text-white text-lg font-bold shrink-0 shadow-sm transition-opacity ${isBatchMode && !selectedIds.has(kol.id) ? 'opacity-50' : ''}`}>
                  {kol.name[0]}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-brand-text text-sm mb-0.5 truncate">{kol.name}</h3>
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-1 text-[10px] font-semibold text-brand-subtext truncate">
                      <MapPin size={10} className="text-brand-primary" />
                      {kol.hospital}
                    </div>
                    <span className="text-[10px] font-bold text-brand-primary bg-blue-50 px-1.5 py-0.5 rounded w-fit">
                      {kol.dept}
                    </span>
                  </div>
                </div>
                
                <div className="flex flex-col items-end gap-1.5 shrink-0 pl-2">
                  <Badge level={kol.level} />
                  {!isBatchMode && (
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          onQuickRecord(kol);
                        }}
                        className="p-2 bg-blue-50 text-brand-primary rounded-lg hover:bg-brand-primary hover:text-white transition-all shadow-sm active:scale-90"
                        title="快捷记录"
                      >
                        <PenLine size={16} />
                      </button>
                      <ChevronRight size={16} className="text-brand-subtext/30 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </div>
        ))}
      </div>

      {/* 批量操作条 */}
      {isBatchMode && selectedIds.size > 0 && (
        <div className="fixed bottom-28 left-4 right-4 z-50 animate-slide-up">
          <div className="bg-brand-text text-white rounded-3xl p-4 shadow-2xl flex items-center justify-end border border-white/10 backdrop-blur-xl">
             <div className="flex gap-2">
               <button 
                  onClick={handleBatchDelete}
                  className="bg-brand-accent text-white px-4 py-2.5 rounded-2xl text-xs font-black shadow-lg shadow-brand-accent/20 active:scale-95 transition-all flex items-center gap-1.5"
               >
                 <Trash2 size={14} />
                 删除
               </button>
               <button 
                  onClick={() => setShowLevelPicker(true)}
                  className="bg-brand-primary text-white px-5 py-2.5 rounded-2xl text-xs font-black shadow-lg shadow-brand-primary/20 active:scale-95 transition-all"
               >
                 修改观念等级
               </button>
             </div>
          </div>
        </div>
      )}

      {/* 等级选择弹窗 */}
      {showLevelPicker && (
        <div className="fixed inset-0 bg-brand-text/40 backdrop-blur-sm z-[200] flex items-center justify-center p-6">
          <div className="bg-white rounded-[2.5rem] w-full max-w-xs p-8 shadow-2xl animate-scale-in">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-black text-brand-text">修改至阶段</h3>
              <button onClick={() => setShowLevelPicker(false)} className="text-brand-subtext"><X size={20}/></button>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {[1, 2, 3, 4, 5].map(l => (
                <button 
                  key={l}
                  onClick={() => handleBatchUpdate(l)}
                  className="flex items-center justify-between p-4 rounded-2xl border border-brand-border hover:border-brand-primary hover:bg-blue-50 transition-all text-left group"
                >
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-brand-subtext group-hover:text-brand-primary">S{l} 阶段</span>
                    <span className="text-sm font-bold text-brand-text">
                      {l === 1 ? '认知萌芽' : l === 2 ? '探索意愿' : l === 3 ? '综合评估' : l === 4 ? '处方优化' : '观念领袖'}
                    </span>
                  </div>
                  <ChevronRight size={18} className="text-brand-border group-hover:text-brand-primary" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};