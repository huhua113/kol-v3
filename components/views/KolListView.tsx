import React, { useState, useMemo } from 'react';
import { Search, Plus, ChevronRight, User, Layers, CheckCircle2, Circle, ChevronDown, Stethoscope, Leaf, Briefcase, Trash2 } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Kol } from '../../types';

interface KolListViewProps {
  kols: Kol[];
  onSelectKol: (kol: Kol) => void;
  onAddClick: () => void;
  isBatchMode: boolean;
  toggleBatchMode: () => void;
  selectedIds: Set<string>;
  toggleSelection: (id: string) => void;
  onOpenBatchModal: () => void;
  onBatchDelete: () => void;
  sortOrder: 'level-desc' | 'level-asc' | 'name-asc';
  setSortOrder: (order: 'level-desc' | 'level-asc' | 'name-asc') => void;
}

export const KolListView: React.FC<KolListViewProps> = ({ 
  kols, 
  onSelectKol, 
  onAddClick,
  isBatchMode,
  toggleBatchMode,
  selectedIds,
  toggleSelection,
  onOpenBatchModal,
  onBatchDelete,
  sortOrder,
  setSortOrder,
}) => {
  const [search, setSearch] = useState('');
  const [isSortMenuOpen, setIsSortMenuOpen] = useState(false);
  
  const filteredKols = kols.filter(k => 
    k.name.toLowerCase().includes(search.toLowerCase()) || k.dept.toLowerCase().includes(search.toLowerCase())
  );

  const sortedKols = useMemo(() => {
    return [...filteredKols].sort((a, b) => {
      if (sortOrder === 'level-desc') {
        return b.level - a.level;
      }
      if (sortOrder === 'level-asc') {
        return a.level - b.level;
      }
      if (sortOrder === 'name-asc') {
        return a.name.localeCompare(b.name, 'zh-Hans-CN');
      }
      return 0;
    });
  }, [filteredKols, sortOrder]);

  const sortOptions: Record<typeof sortOrder, string> = {
    'level-desc': '按观念降序',
    'level-asc': '按观念升序',
    'name-asc': '按姓名排序',
  };

  // Function to generate a consistent gradient based on name length
  const getGradient = (name: string) => {
    const gradients = [
      'from-blue-400 to-indigo-500',
      'from-emerald-400 to-teal-500',
      'from-orange-400 to-red-500',
      'from-pink-400 to-rose-500',
      'from-violet-400 to-purple-500'
    ];
    return gradients[name.length % gradients.length];
  };

  const getDeptIcon = (dept: string) => {
    if (dept.includes('外科')) return <Stethoscope size={12} />;
    if (dept.includes('营养')) return <Leaf size={12} />;
    return <Briefcase size={12} />;
  };

  const getDeptStyle = (dept: string) => {
      return 'bg-brand-light text-brand-subtext border-brand-border/80';
  };

  return (
    <div className="space-y-4 animate-fade-in pb-24">
      <div className="flex gap-3">
        <div className="flex-1 relative group">
          <Search className="absolute left-3 top-2.5 text-brand-subtext group-focus-within:text-brand-primary transition-colors" size={18} />
          <input 
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-brand-border bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all shadow-sm"
            placeholder="搜索姓名或科室..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        
        <Button 
            variant={isBatchMode ? 'secondary' : 'outline'} 
            onClick={toggleBatchMode} 
            className={`rounded-xl px-3 transition-all ${isBatchMode ? 'bg-brand-text text-white border-brand-text' : ''}`}
        >
            {isBatchMode ? '取消' : <Layers size={20} />}
        </Button>

        {!isBatchMode && (
             <Button onClick={onAddClick} variant="primary" className="rounded-xl px-4 shadow-md shadow-brand-primary/20">
                <Plus size={20} />
            </Button>
        )}
      </div>

      <div className="px-1 flex justify-between items-center">
        <p className="text-xs text-brand-subtext font-medium flex items-center gap-1">
          <User size={12} />
          共 {filteredKols.length} 位专家
        </p>
        <div className="relative">
          <button onClick={() => setIsSortMenuOpen(!isSortMenuOpen)} className="flex items-center gap-1.5 text-xs font-bold text-brand-primary bg-indigo-50/80 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition-colors">
            {sortOptions[sortOrder]}
            <ChevronDown size={14} className={`transition-transform duration-200 ${isSortMenuOpen ? 'rotate-180' : ''}`} />
          </button>
          {isSortMenuOpen && (
            <div className="absolute top-full right-0 mt-1 w-36 bg-white rounded-lg shadow-xl border border-brand-border z-20 animate-fade-in p-1">
              {Object.entries(sortOptions).map(([key, value]) => (
                <button
                  key={key}
                  onClick={() => {
                    setSortOrder(key as any);
                    setIsSortMenuOpen(false);
                  }}
                  className={`block w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${sortOrder === key ? 'bg-brand-primary text-white font-bold' : 'hover:bg-brand-light'}`}
                >
                  {value}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-3 pb-2">
        {sortedKols.map(kol => {
          const isSelected = selectedIds.has(kol.id);
          return (
            <Card key={kol.id} className={`active:scale-[0.98] transition-all duration-200 hover:border-brand-primary/30 group p-3 border-l-4 border-l-transparent relative overflow-hidden ${isBatchMode && isSelected ? '!border-l-brand-primary bg-indigo-50/50 shadow-md ring-1 ring-brand-primary' : 'hover:border-l-brand-primary'}`} >
              <div onClick={() => isBatchMode ? toggleSelection(kol.id) : onSelectKol(kol)} className="flex justify-between items-center cursor-pointer relative z-10">
                <div className="flex items-center gap-3">
                  {isBatchMode && (
                      <div className={`transition-all duration-300 ${isSelected ? 'text-brand-primary scale-110' : 'text-gray-300'}`}>
                          {isSelected ? <CheckCircle2 size={24} fill="#6366F1" className="text-white" /> : <Circle size={24} />}
                      </div>
                  )}
                  
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${getGradient(kol.name)} flex items-center justify-center text-white font-bold shadow-md shrink-0`}>
                    {kol.name.length > 0 ? kol.name[0] : <User size={20} />}
                  </div>

                  <div>
                    <h3 className="font-bold text-brand-text text-base leading-tight">
                        {kol.name}
                    </h3>
                    <div className={`text-[10px] font-bold px-2 py-0.5 rounded-md inline-flex items-center gap-1 mt-1 border ${getDeptStyle(kol.dept)}`}>
                        {getDeptIcon(kol.dept)}
                        {kol.dept}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge level={kol.level} />
                  {!isBatchMode && (
                      <div className="w-8 h-8 rounded-full bg-brand-light flex items-center justify-center text-brand-subtext group-hover:bg-brand-primary group-hover:text-white transition-colors shadow-sm">
                          <ChevronRight size={18} />
                      </div>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
        {sortedKols.length === 0 && (
            <div className="flex flex-col items-center justify-center text-brand-subtext py-16 opacity-60">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <Search size={32} className="text-gray-400" />
                </div>
                <p>未找到相关专家</p>
                <button onClick={() => setSearch('')} className="mt-2 text-brand-primary font-bold text-sm">清除搜索</button>
            </div>
        )}
      </div>

      {isBatchMode && selectedIds.size > 0 && (
          <div className="fixed bottom-24 left-4 right-4 z-40 animate-slide-up">
              <div className="flex gap-3 p-2 bg-white/80 backdrop-blur-md rounded-2xl shadow-2xl border border-brand-border">
                <Button onClick={onBatchDelete} variant="danger" className="flex-1 shadow-lg shadow-rose-500/30 py-3 text-base">
                    <Trash2 size={16}/> 删除 ({selectedIds.size})
                </Button>
                <Button onClick={onOpenBatchModal} className="flex-1 shadow-lg shadow-brand-text/30 py-3 text-base bg-brand-text hover:bg-black border-none ring-2 ring-white/50">
                    <Layers size={16}/> 更新 ({selectedIds.size})
                </Button>
              </div>
          </div>
      )}
    </div>
  );
};