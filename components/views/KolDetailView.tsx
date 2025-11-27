import React from 'react';
import { ArrowLeft, Trash2, Calendar, MessageSquare, TrendingUp, History, Info, Stethoscope, Leaf, Briefcase, Award } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Area, AreaChart } from 'recharts';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Kol, Visit } from '../../types';
import { LEVELS } from '../../constants';

interface KolDetailViewProps {
  kol: Kol;
  visits: Visit[];
  onBack: () => void;
  onDeleteVisit: (visitId: number) => void;
  onRecordVisit: () => void;
}

export const KolDetailView: React.FC<KolDetailViewProps> = ({ kol, visits, onBack, onDeleteVisit, onRecordVisit }) => {
  const history = visits
    .filter(v => v.kolId === kol.id)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Prepare chart data
  const chartData = history.map(h => ({
    date: h.date,
    level: h.level
  }));

  const getDeptIcon = (dept: string) => {
    if (dept.includes('外科')) return <Stethoscope size={14} />;
    if (dept.includes('营养')) return <Leaf size={14} />;
    return <Briefcase size={14} />;
  };

  return (
    <div className="absolute inset-0 bg-brand-bg z-20 overflow-y-auto">
      <button 
        onClick={onBack} 
        className="fixed top-6 left-4 z-40 w-10 h-10 bg-black/40 text-white rounded-full flex items-center justify-center backdrop-blur-sm hover:bg-black/60 transition-all active:scale-90"
      >
        <ArrowLeft size={22} />
      </button>

      <div className="px-4 pt-20 space-y-5 pb-28">
        {/* Header Card */}
        <Card className="bg-gradient-to-br from-brand-primary to-indigo-700 border-none text-white shadow-lg shadow-indigo-500/30 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            {getDeptIcon(kol.dept).type === Stethoscope ? <Stethoscope size={100} /> : <Leaf size={100} />}
          </div>
          
          <div className="flex justify-between items-start mb-6 relative z-10">
            <div>
              <h1 className="text-3xl font-bold mb-2">{kol.name}</h1>
              <p className="text-indigo-100 font-bold bg-white/20 px-3 py-1 rounded-lg inline-flex items-center gap-1.5 text-xs backdrop-blur-sm border border-white/10">
                {getDeptIcon(kol.dept)}
                {kol.dept}
              </p>
            </div>
            <div className="bg-white/90 backdrop-blur-md p-1.5 rounded-xl shadow-lg">
                <Badge level={kol.level} />
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-sm bg-black/20 p-3 rounded-xl border border-white/10 backdrop-blur-sm relative z-10">
            <Award size={18} className="text-brand-warning" />
            <span className="opacity-90">当前处于: <span className="font-bold text-white text-base ml-1">{LEVELS.find(l => l.id === kol.level)?.label}</span></span>
          </div>
        </Card>

        {/* Trend Chart */}
        {chartData.length > 1 && (
          <Card>
            <h3 className="text-base font-bold text-brand-text mb-4 flex items-center gap-2">
                <TrendingUp size={20} className="text-brand-primary" /> 观念趋势
            </h3>
            <div className="h-56 w-full -ml-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorLevel" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366F1" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#64748B' }} axisLine={false} tickLine={false} dy={10} />
                  <YAxis domain={[1, 5]} hide />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    cursor={{ stroke: '#6366F1', strokeWidth: 1, strokeDasharray: '4 4' }}
                  />
                  <Area type="monotone" dataKey="level" stroke="#6366F1" strokeWidth={3} fillOpacity={1} fill="url(#colorLevel)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        )}

        {/* Timeline */}
        <div>
          <h3 className="text-base font-bold text-brand-text mb-5 flex items-center gap-2">
            <History size={20} className="text-brand-secondary" /> 拜访记录
          </h3>
          <div className="space-y-5 border-l-[3px] border-brand-light ml-3.5 pl-8 relative pb-2">
            {history.length === 0 && (
                <div className="text-center py-8 bg-white rounded-xl border border-dashed border-brand-border">
                    <p className="text-sm text-gray-400">暂无记录，点击下方按钮添加</p>
                </div>
            )}
            
            {[...history].reverse().map((visit) => (
              <div key={visit.id} className="relative group animate-slide-up">
                <div className="absolute -left-[39px] top-4 w-5 h-5 rounded-full bg-white border-4 border-brand-secondary shadow-sm z-10 group-hover:scale-125 transition-transform"></div>
                <Card className="p-4 hover:border-brand-secondary/50 transition-colors shadow-sm hover:shadow-md">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-brand-subtext bg-brand-light px-2 py-1 rounded-md">
                        <Calendar size={12} />
                        {visit.date}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge level={visit.level} />
                      <button 
                        onClick={() => onDeleteVisit(visit.id)}
                        className="text-brand-subtext hover:text-brand-accent transition-colors p-1.5 hover:bg-rose-50 rounded-full"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <MessageSquare size={16} className="text-brand-subtext mt-1 shrink-0" />
                    <p className="text-sm text-brand-text leading-relaxed">{visit.content}</p>
                  </div>

                  {visit.competitor && (
                    <div className="mt-4 p-3 bg-gradient-to-r from-rose-50 to-white border border-rose-100 rounded-xl text-xs">
                      <span className="font-bold text-brand-accent block mb-1 flex items-center gap-1">
                        <Info size={12}/> 竞品信息:
                      </span>
                      <p className="text-gray-700 pl-1">{visit.competitor}</p>
                    </div>
                  )}
                </Card>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="fixed bottom-4 left-4 right-4 z-30">
        <Button onClick={onRecordVisit} className="w-full shadow-xl shadow-brand-primary/20 py-3 text-base rounded-2xl">
          记录拜访 / 更新观念
        </Button>
      </div>
    </div>
  );
};