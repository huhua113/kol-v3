import React from 'react';
import { Download, Trash2, AlertTriangle, Calendar } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Kol, Visit } from '../../types';

interface CompetitorViewProps {
  kols: Kol[];
  visits: Visit[];
  onDeleteVisit: (visitId: number) => void;
}

export const CompetitorView: React.FC<CompetitorViewProps> = ({ kols, visits, onDeleteVisit }) => {
  const compVisits = visits.filter(v => v.competitor).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const exportCompetitorData = () => {
    const data = visits.filter(v => v.competitor).map(v => {
      const kol = kols.find(k => k.id === v.kolId);
      return `${v.date} - ${kol?.name} (${kol?.dept}): ${v.competitor}`;
    }).join('\n');
    
    const blob = new Blob([data], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'competitor_intel.txt';
    a.click();
  };
  
  return (
    <div className="space-y-4 animate-fade-in">
       <div className="flex justify-between items-center mb-4 sticky top-0 bg-brand-bg/95 backdrop-blur z-10 py-2">
          <h2 className="text-lg font-bold text-brand-text flex items-center gap-2">
            <AlertTriangle className="text-brand-accent" size={20}/>
            竞品情报收集
          </h2>
          <Button variant="outline" onClick={exportCompetitorData} className="text-xs h-9 px-3 border-dashed">
            <Download size={14} /> 导出数据
          </Button>
       </div>

       {compVisits.length === 0 && (
         <div className="flex flex-col items-center justify-center text-brand-subtext py-20 opacity-60">
             <AlertTriangle size={48} className="mb-2" />
             <p>暂无竞品相关记录</p>
         </div>
       )}

       {compVisits.map(v => {
         const k = kols.find(k => k.id === v.kolId);
         return (
           <Card key={v.id} className="relative border-l-4 border-l-brand-accent overflow-hidden">
             <div className="flex justify-between text-xs text-brand-subtext mb-3">
               <span className="flex items-center gap-1 bg-brand-light px-2 py-0.5 rounded">
                   <Calendar size={12}/> {v.date}
               </span>
               <span className="font-bold text-brand-primary bg-indigo-50 px-2 py-0.5 rounded">{k?.name} - {k?.dept}</span>
             </div>
             <p className="text-sm text-brand-text font-medium leading-relaxed mb-4">{v.competitor}</p>
             <button 
                onClick={() => onDeleteVisit(v.id)}
                className="absolute bottom-3 right-3 text-brand-subtext hover:text-brand-accent hover:bg-rose-50 p-2 rounded-full transition-all"
              >
                <Trash2 size={16} />
             </button>
           </Card>
         )
       })}
    </div>
  );
};