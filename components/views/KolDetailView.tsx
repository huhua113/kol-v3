import React from 'react';
import { ArrowLeft, Trash2, Calendar, TrendingUp, History, Info, Stethoscope, Briefcase, Award, Zap, ShieldCheck, MapPin } from 'lucide-react';
import { ResponsiveContainer, XAxis, YAxis, Area, AreaChart } from 'recharts';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Kol, Visit } from '../../types';
import { LEVELS } from '../../constants';

interface KolDetailViewProps {
  kol: Kol;
  visits: Visit[];
  onBack: () => void;
  onDeleteVisit: (visitId: string) => void;
  onRecordVisit: () => void;
}

export const KolDetailView: React.FC<KolDetailViewProps> = ({ kol, visits, onBack, onDeleteVisit, onRecordVisit }) => {
  const history = visits
    .filter(v => v.kolId === kol.id)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const chartData = history.map(h => ({ date: h.date, level: h.level }));

  return (
    <div className="absolute inset-0 bg-brand-bg z-[60] overflow-y-auto animate-fade-in scrollbar-hide">
      <header className="fixed top-0 max-w-sm w-full z-[70] px-6 py-6 flex justify-between items-center bg-brand-bg/80 backdrop-blur-md">
        <button onClick={onBack} className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-brand-text shadow-card active:scale-95 transition-all">
          <ArrowLeft size={22} />
        </button>
        <h2 className="text-sm font-bold text-brand-text tracking-widest uppercase opacity-30">Profile Detail</h2>
        <div className="w-12"></div>
      </header>

      <div className="px-5 pt-28 pb-32 space-y-6">
        <Card className="bg-white overflow-hidden relative shadow-card">
          <div className="absolute top-[-20%] right-[-10%] w-40 h-40 bg-brand-primary/10 rounded-full blur-2xl"></div>
          <div className="relative z-10 space-y-4">
             <div className="flex justify-between items-start">
                <div>
                   <h1 className="text-3xl font-black mb-1 text-brand-text">{kol.name}</h1>
                   <div className="flex items-center gap-1.5 text-brand-primary text-xs font-bold bg-brand-primary/10 px-2 py-1 rounded-lg">
                      <MapPin size={12} className="text-brand-primary" />
                      {kol.hospital}
                   </div>
                </div>
                <Badge level={kol.level} />
             </div>
             <div className="bg-brand-light p-4 rounded-2xl flex items-center gap-3 border border-brand-border shadow-inner-soft">
                <Award className="text-brand-warning" size={20} />
                <span className="text-sm font-bold text-brand-text">
                   <span className="text-brand-subtext">当前阶段: </span>
                   <span className="ml-1 underline underline-offset-4 decoration-brand-primary/50">{LEVELS.find(l => l.id === kol.level)?.label}</span>
                </span>
             </div>
          </div>
        </Card>

        {chartData.length > 1 && (
          <Card>
            <h3 className="text-sm font-bold text-brand-text mb-6 flex items-center gap-2 opacity-60">
               <TrendingUp size={16} /> 观念心路历程
            </h3>
            <div className="h-44 w-full -ml-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorLevel" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" hide />
                  <YAxis domain={[1, 5]} hide />
                  <Area type="monotone" dataKey="level" stroke="#3B82F6" strokeWidth={3} fillOpacity={1} fill="url(#colorLevel)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        )}

        <div className="space-y-6">
          <h3 className="text-sm font-bold text-brand-text flex items-center gap-2 opacity-60">
             <History size={16} /> 历史成长记录
          </h3>
          
          <div className="relative pl-6 border-l border-brand-border/40 space-y-8 ml-2">
            {[...history].reverse().map((visit) => (
              <div key={visit.id} className="relative animate-slide-up">
                <div className="absolute -left-[30px] top-1.5 w-4 h-4 rounded-full bg-brand-bg border-2 border-brand-primary z-10 shadow-sm"></div>
                
                <div className="ml-2">
                   <div className="flex justify-between items-start mb-4">
                      <div className="text-[10px] font-black text-brand-primary bg-blue-100/50 px-2.5 py-1 rounded-full uppercase tracking-widest border border-blue-200">
                         {visit.date}
                      </div>
                      <div className="flex items-center gap-2">
                         <div className="text-right">
                           <Badge level={visit.level} />
                           <div className="text-[10px] font-bold text-brand-subtext/80 leading-tight mt-0.5">{LEVELS.find(l => l.id === visit.level)?.label.split(' ')[1]}</div>
                         </div>
                         <button onClick={() => onDeleteVisit(visit.id)} className="text-brand-subtext/30 hover:text-brand-accent p-1 transition-all active:scale-90">
                            <Trash2 size={14} />
                         </button>
                      </div>
                   </div>

                   <p className="text-sm text-brand-text leading-relaxed font-semibold mb-4">
                      {visit.content || '未填写具体沟通内容'}
                   </p>

                   {(visit.products?.length || visit.diseaseAreas?.length || visit.efficacyInfo || visit.safetyInfo || visit.competitor) && (
                     <div className="space-y-4 pt-4 mt-4 border-t border-brand-border/30">
                        {visit.products && visit.products.length > 0 && (
                            <div className="flex items-start gap-3">
                                <Briefcase size={15} className="text-indigo-500 shrink-0 mt-0.5" />
                                <div className="flex flex-wrap items-center gap-2">
                                    {visit.products.map(p => <span key={p} className="text-[10px] font-bold bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-full">{p}</span>)}
                                </div>
                            </div>
                        )}
                        {visit.diseaseAreas && visit.diseaseAreas.length > 0 && (
                             <div className="flex items-start gap-3">
                                <Stethoscope size={15} className="text-teal-500 shrink-0 mt-0.5" />
                                <div className="flex flex-wrap items-center gap-2">
                                    {visit.diseaseAreas.map(d => <span key={d} className="text-[10px] font-bold bg-teal-50 text-teal-600 px-2.5 py-1 rounded-full">{d}</span>)}
                                </div>
                            </div>
                        )}
                        {visit.efficacyInfo && (
                           <div className="flex gap-3">
                              <Zap size={15} className="text-brand-primary shrink-0 mt-0.5" />
                              <div className="text-[11px] leading-relaxed"><span className="font-bold text-brand-text">价值反馈:</span> <span className="text-brand-subtext font-medium">{visit.efficacyInfo}</span></div>
                           </div>
                        )}
                        {visit.safetyInfo && (
                           <div className="flex gap-3">
                              <ShieldCheck size={15} className="text-brand-secondary shrink-0 mt-0.5" />
                              <div className="text-[11px] leading-relaxed"><span className="font-bold text-brand-text">安全信息:</span> <span className="text-brand-subtext font-medium">{visit.safetyInfo}</span></div>
                           </div>
                        )}
                        {visit.competitor && (
                            <div className="flex gap-3">
                                <Info size={15} className="text-brand-accent shrink-0 mt-0.5" />
                                <div className="text-[11px] leading-relaxed"><span className="font-bold text-brand-text">竞品动态:</span> <span className="text-brand-subtext font-medium">{visit.competitor}</span></div>
                            </div>
                        )}
                     </div>
                   )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="fixed bottom-8 left-0 right-0 max-w-sm mx-auto px-6 z-[80]">
        <Button onClick={onRecordVisit} className="w-full h-16 text-base rounded-[1.5rem] shadow-soft font-bold">
           记录新访谈 / 更新观念
        </Button>
      </div>
    </div>
  );
};