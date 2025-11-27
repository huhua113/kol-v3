import React, { useMemo } from 'react';
import { 
  PieChart as PieChartIcon, 
  Users, 
  Activity, 
  TrendingUp, 
  Zap, 
  AlertTriangle, 
  Award,
  ArrowUpRight,
  Target,
  ArrowRight,
  Rocket
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { Card } from '../ui/Card';
import { Kol, Visit } from '../../types';
import { Badge } from '../ui/Badge';

interface DashboardViewProps {
  kols: Kol[];
  visits: Visit[];
  setActiveTab: (tab: 'list' | 'competitors') => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ kols, visits, setActiveTab }) => {
  // --- Data Calculations ---

  const levelCounts = [1, 2, 3, 4, 5].map(l => ({
    name: `S${l}`,
    value: kols.filter(k => k.level === l).length
  }));
  
  const dominantLevel = useMemo(() => {
    const sorted = [...levelCounts].sort((a, b) => b.value - a.value);
    return sorted[0];
  }, [levelCounts]);

  const upgradedKols = useMemo(() => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const upgrades: { name: string; from: number; to: number; }[] = [];
  
    kols.forEach(kol => {
      const kolVisits = visits
        .filter(v => v.kolId === kol.id)
        .sort((a, b) => {
            const dateA = new Date(a.date).getTime();
            const dateB = new Date(b.date).getTime();
            if (dateA !== dateB) return dateA - dateB;
            return a.timestamp - b.timestamp;
        });
  
      if (kolVisits.length < 2) return;
  
      // FIX: Replaced `findLastIndex` with a manual loop for wider JS environment compatibility.
      let latestVisitIndexInPeriod = -1;
      for (let i = kolVisits.length - 1; i >= 0; i--) {
        if (new Date(kolVisits[i].date) >= thirtyDaysAgo) {
          latestVisitIndexInPeriod = i;
          break;
        }
      }
  
      if (latestVisitIndexInPeriod > 0) {
          const latestVisit = kolVisits[latestVisitIndexInPeriod];
          const previousVisit = kolVisits[latestVisitIndexInPeriod - 1];
  
          if (latestVisit.level > previousVisit.level) {
              upgrades.push({
                  name: kol.name,
                  from: previousVisit.level,
                  to: latestVisit.level,
              });
          }
      }
    });
    return upgrades;
  }, [kols, visits]);


  // Vibrant Colors
  const PIE_COLORS = ['#cbd5e1', '#38bdf8', '#34d399', '#818cf8', '#fb7185'];

  return (
    <div className="space-y-6 animate-fade-in pb-4">
       
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-violet-600 to-indigo-600 rounded-3xl p-6 text-white shadow-xl shadow-indigo-200 overflow-hidden group">
        <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3 opacity-90">
                <span className="text-[10px] font-bold bg-white/20 px-2 py-0.5 rounded-full backdrop-blur-md border border-white/10 flex items-center gap-1">
                    <Zap size={10} fill="currentColor" />
                    High Energy
                </span>
            </div>
            <h2 className="text-3xl font-black tracking-tight mb-2 leading-tight">
                早安, 进取者! 🚀
            </h2>
            <p className="font-medium opacity-90 text-sm max-w-[80%]">
                今天也是充满机遇的一天，继续保持高效节奏。
            </p>
        </div>
        {/* Decorative Background Icons */}
        <Target size={140} className="absolute -right-8 -bottom-10 text-white/10 rotate-12 group-hover:rotate-0 transition-transform duration-700 ease-out" />
        <div className="absolute top-4 right-20 w-12 h-12 bg-white/10 rounded-full blur-xl animate-pulse-slow"></div>
        <div className="absolute -bottom-4 left-10 w-24 h-24 bg-purple-500/30 rounded-full blur-2xl"></div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-100 p-3 rounded-2xl flex flex-col items-center justify-center text-center shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-1 opacity-10 group-hover:opacity-20 transition-opacity">
                <Users size={40} className="text-blue-500" />
            </div>
            <div className="w-9 h-9 rounded-full bg-white text-blue-500 flex items-center justify-center mb-1.5 shadow-sm ring-2 ring-blue-100">
                <Users size={18} />
            </div>
            <span className="text-2xl font-black text-blue-900">{kols.length}</span>
            <span className="text-[10px] font-bold text-blue-600/80 uppercase tracking-wide">管理专家</span>
        </div>

        <div className="bg-gradient-to-br from-rose-50 to-rose-100/50 border border-rose-100 p-3 rounded-2xl flex flex-col items-center justify-center text-center shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-1 opacity-10 group-hover:opacity-20 transition-opacity">
                <AlertTriangle size={40} className="text-rose-500" />
            </div>
            <div className="w-9 h-9 rounded-full bg-white text-rose-500 flex items-center justify-center mb-1.5 shadow-sm ring-2 ring-rose-100">
                <AlertTriangle size={18} />
            </div>
            <span className="text-2xl font-black text-rose-900">{visits.filter(v => v.competitor).length}</span>
            <span className="text-[10px] font-bold text-rose-600/80 uppercase tracking-wide">竞品情报</span>
        </div>
      </div>

      {/* Main Analysis Section */}
      <div className="space-y-4">
        
        {/* Pie Chart Card */}
        <Card className="border-none shadow-lg shadow-slate-200/50 overflow-visible relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-50 to-transparent rounded-tr-2xl -z-10"></div>
            <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-brand-text flex items-center gap-2">
                    <div className="bg-brand-light p-1.5 rounded-lg text-brand-primary">
                      <PieChartIcon size={18}/>
                    </div>
                    观念分布
                </h3>
                {dominantLevel && (
                    <div className="text-xs font-bold text-brand-subtext bg-brand-light px-2 py-1 rounded-lg flex items-center gap-1 border border-brand-border/50">
                        <Award size={12} className="text-amber-500" />
                        主流: <span className="text-brand-text bg-white px-1.5 rounded shadow-sm text-[10px]">{dominantLevel.name}</span>
                    </div>
                )}
            </div>
            
            <div className="flex items-center">
                <div className="h-[180px] w-1/2 -ml-4">
                    <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                        data={levelCounts}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={65}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                        cornerRadius={4}
                        >
                        {levelCounts.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                        </Pie>
                        <Tooltip 
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                            itemStyle={{ color: '#1E293B', fontWeight: 'bold' }}
                        />
                    </PieChart>
                    </ResponsiveContainer>
                </div>
                <div className="w-1/2 pl-4">
                    <div>
                        <p className="text-xs font-bold text-brand-subtext mb-1">当前分布</p>
                        <div className="grid grid-cols-1 gap-1.5">
                            {levelCounts.map((l, i) => (
                                <div key={i} className="flex items-center gap-1.5 text-[10px] font-bold text-brand-subtext bg-brand-light/50 px-2 py-1 rounded-md">
                                    <div className="w-2 h-2 rounded-full shrink-0 shadow-sm" style={{ background: PIE_COLORS[i] }}></div>
                                    <span className="text-brand-text">{l.name}</span> 
                                    <span className="text-gray-400 ml-auto">{l.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </Card>

        {/* Trend Chart Card */}
        <Card className="border-none shadow-lg shadow-slate-200/50">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-brand-text flex items-center gap-2">
                    <div className="bg-emerald-50 p-1.5 rounded-lg text-brand-success">
                      <TrendingUp size={18}/>
                    </div>
                    近一月观念提升
                </h3>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-1 rounded-full flex items-center gap-1">
                    <Zap size={10} className="animate-pulse" />
                    {upgradedKols.length} 位专家
                </span>
            </div>
            
            {upgradedKols.length > 0 ? (
            <div className="space-y-2 max-h-40 overflow-y-auto pr-2 scrollbar-hide">
                {upgradedKols.map((kol, index) => (
                    <div key={index} className="flex items-center justify-between bg-emerald-50/60 p-2.5 rounded-xl text-sm animate-fade-in">
                    <span className="font-bold text-brand-text">{kol.name}</span>
                    <div className="flex items-center gap-2 font-bold">
                        <Badge level={kol.from} />
                        <ArrowRight size={14} className="text-emerald-500 shrink-0" />
                        <Badge level={kol.to} />
                    </div>
                    </div>
                ))}
            </div>
            ) : (
            <div className="h-40 flex flex-col items-center justify-center text-center text-brand-subtext text-xs bg-brand-light/50 rounded-2xl border border-dashed border-brand-border">
                <Rocket size={32} className="mb-2 opacity-20" />
                <p>暂无专家观念提升记录<br />继续努力！</p>
            </div>
            )}
        </Card>
      </div>

      {/* Action Tiles */}
      <div className="grid grid-cols-2 gap-3">
        <button 
          onClick={() => setActiveTab('list')}
          className="bg-white p-4 rounded-2xl shadow-sm border border-brand-border text-left relative overflow-hidden group hover:border-brand-primary transition-colors"
        >
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
            <div className="relative z-10">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 text-brand-primary flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-sm">
                    <Users size={20} />
                </div>
                <h4 className="font-bold text-brand-text">专家列表</h4>
                <p className="text-xs text-brand-subtext mt-1">查看 {kols.length} 位专家详情</p>
            </div>
            <ArrowUpRight size={16} className="absolute bottom-4 right-4 text-brand-subtext group-hover:text-brand-primary transition-colors" />
        </button>

        <button 
          onClick={() => setActiveTab('competitors')}
          className="bg-white p-4 rounded-2xl shadow-sm border border-brand-border text-left relative overflow-hidden group hover:border-brand-accent transition-colors"
        >
            <div className="absolute top-0 right-0 w-24 h-24 bg-rose-50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
            <div className="relative z-10">
                <div className="w-10 h-10 rounded-xl bg-rose-100 text-brand-accent flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-sm">
                    <Activity size={20} />
                </div>
                <h4 className="font-bold text-brand-text">竞品分析</h4>
                <p className="text-xs text-brand-subtext mt-1">发现潜在市场机会</p>
            </div>
            <ArrowUpRight size={16} className="absolute bottom-4 right-4 text-brand-subtext group-hover:text-brand-accent transition-colors" />
        </button>
      </div>
    </div>
  );
};