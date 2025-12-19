import React, { useState, useMemo } from 'react';
import { Download, Trash2, Calendar, Search, Zap, ShieldCheck, User, MapPin, LayoutGrid } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Kol, Visit } from '../../types';

type IntelType = 'competitor' | 'efficacy' | 'safety';

interface IntelligenceViewProps {
  kols: Kol[];
  visits: Visit[];
  onDeleteVisit: (visitId: string, type: IntelType) => void;
}

export const CompetitorView: React.FC<IntelligenceViewProps> = ({ kols, visits, onDeleteVisit }) => {
  const [search, setSearch] = useState('');
  
  const allIntel = useMemo(() => {
    const stream: Array<{
      type: IntelType;
      content: string;
      date: string;
      kolName: string;
      dept: string;
      hospital: string;
      visitId: string;
      timestamp: number;
    }> = [];

    visits.forEach(v => {
      const k = kols.find(kol => kol.id === v.kolId);
      if (!k) return;
      if (v.competitor) stream.push({ type: 'competitor', content: v.competitor, date: v.date, kolName: k.name, dept: k.dept, hospital: k.hospital, visitId: v.id, timestamp: v.timestamp });
      if (v.efficacyInfo) stream.push({ type: 'efficacy', content: v.efficacyInfo, date: v.date, kolName: k.name, dept: k.dept, hospital: k.hospital, visitId: v.id, timestamp: v.timestamp });
      if (v.safetyInfo) stream.push({ type: 'safety', content: v.safetyInfo, date: v.date, kolName: k.name, dept: k.dept, hospital: k.hospital, visitId: v.id, timestamp: v.timestamp });
    });

    return stream.sort((a, b) => b.timestamp - a.timestamp);
  }, [visits, kols]);

  const filteredIntel = useMemo(() => {
    const s = search.toLowerCase();
    return allIntel.filter(i => 
      i.content.toLowerCase().includes(s) || i.kolName.toLowerCase().includes(s) || i.hospital.toLowerCase().includes(s)
    );
  }, [allIntel, search]);

  return (
    <div className="space-y-5 animate-fade-in pb-24 px-1">
       <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-black text-brand-text flex items-center gap-2">
            <Zap className="text-brand-primary" size={24} fill="currentColor" />
            情报中心
          </h2>
       </div>

       <div className="neu-inset flex items-center p-3">
          <Search className="text-brand-subtext mr-3" size={18} />
          <input 
            className="w-full bg-transparent border-none text-sm outline-none"
            placeholder="全文检索详情内容..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
       </div>

       {filteredIntel.length === 0 && (
         <div className="flex flex-col items-center justify-center text-brand-subtext py-20 opacity-40">
             <LayoutGrid size={48} className="mb-4" />
             <p className="text-sm font-bold">暂无相关情报详情</p>
         </div>
       )}

       <div className="space-y-6">
         {filteredIntel.map((item) => (
           <Card key={`${item.visitId}-${item.type}`} className="relative border-t-4 border-t-transparent">
             <div className="flex justify-between items-start mb-4">
                <div className="flex flex-col gap-1.5">
                  <div className={`text-[9px] font-black px-3 py-1 rounded-full w-fit uppercase tracking-wider ${
                    item.type === 'competitor' ? 'bg-brand-accent text-white shadow-neu-sm' : 
                    item.type === 'efficacy' ? 'bg-brand-warning text-white shadow-neu-sm' : 'bg-brand-success text-white shadow-neu-sm'
                  }`}>
                    {item.type === 'competitor' ? '竞品' : item.type === 'efficacy' ? '疗效' : '安全'}
                  </div>
                  <div className="flex items-center gap-1.5 text-sm font-black text-brand-text">
                    <User size={14} className="text-brand-primary" />
                    {item.kolName}
                  </div>
                  <div className="flex items-center gap-1 text-[10px] font-bold text-brand-subtext">
                    <MapPin size={12} />
                    {item.hospital}
                  </div>
                </div>
                <div className="flex items-center gap-1 text-[10px] font-black text-brand-subtext bg-brand-light/50 px-2 py-1 rounded-xl shadow-neu-inner">
                   <Calendar size={12}/> {item.date}
                </div>
             </div>

             <div className="neu-inset p-4">
               <p className="text-xs text-brand-text font-bold leading-relaxed italic">
                 "{item.content}"
               </p>
             </div>

             <button 
                onClick={() => onDeleteVisit(item.visitId, item.type)}
                className="absolute bottom-3 right-3 text-brand-subtext/30 hover:text-brand-accent p-2 transition-all active:scale-90"
              >
                <Trash2 size={16} />
             </button>
           </Card>
         ))}
       </div>
    </div>
  );
};