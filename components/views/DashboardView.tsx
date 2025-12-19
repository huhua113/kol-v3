import React, { useMemo } from 'react';
import { 
  PieChart as PieChartIcon, 
  Users, 
  TrendingUp, 
  Zap, 
  AlertTriangle, 
  Rocket,
  ShieldCheck,
  Box,
  LayoutGrid,
  Activity
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Card } from '../ui/Card';
import { Kol, Visit } from '../../types';
import { Badge } from '../ui/Badge';
import { PRODUCTS, DISEASE_AREAS } from '../../constants';

interface DashboardViewProps {
  kols: Kol[];
  visits: Visit[];
  setActiveTab: (tab: 'list' | 'competitors') => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ kols, visits, setActiveTab }) => {
  const levelCounts = [1, 2, 3, 4, 5].map(l => ({
    name: `S${l}`,
    value: kols.filter(k => k.level === l).length
  }));
  
  const dominantLevel = useMemo(() => {
    const sorted = [...levelCounts].sort((a, b) => b.value - a.value);
    return sorted[0];
  }, [levelCounts]);

  const intelStats = useMemo(() => ({
    competitor: visits.filter(v => v.competitor).length,
    efficacy: visits.filter(v => v.efficacyInfo).length,
    safety: visits.filter(v => v.safetyInfo).length,
  }), [visits]);

  const productCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    PRODUCTS.forEach(p => counts[p] = 0);
    
    visits.forEach(v => v.products?.forEach(p => {
      if (counts.hasOwnProperty(p)) {
        counts[p]++;
      } else {
        counts[p] = 1;
      }
    }));
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [visits]);

  const diseaseAreaCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    DISEASE_AREAS.forEach(d => counts[d] = 0);
    
    visits.forEach(v => v.diseaseAreas?.forEach(d => {
      if (counts.hasOwnProperty(d)) {
        counts[d]++;
      } else {
        counts[d] = 1;
      }
    }));
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [visits]);

  // Morandi Palette -> New Vibrant Palette
  const PIE_COLORS = ['#A78BFA', '#7DD3FC', '#6EE7B7', '#FBCFE8', '#FDE047'];

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      <div className="grid grid-cols-2 gap-4">
        {[
          { label: '库内专家', val: kols.length, icon: Users, color: 'text-brand-primary', bg: 'bg-brand-primary/10' },
          { label: '竞品动态', val: intelStats.competitor, icon: AlertTriangle, color: 'text-brand-accent', bg: 'bg-brand-accent/10' },
          { label: '疗效反馈', val: intelStats.efficacy, icon: Zap, color: 'text-brand-warning', bg: 'bg-brand-warning/10' },
          { label: '安全记录', val: intelStats.safety, icon: ShieldCheck, color: 'text-brand-success', bg: 'bg-brand-success/10' },
        ].map((item, i) => (
          <Card key={i} className="flex flex-col items-center py-6">
            <div className={`p-3 rounded-2xl ${item.bg} ${item.color} mb-3`}>
               <item.icon size={20} strokeWidth={2.5} />
            </div>
            <span className="text-2xl font-bold text-brand-text mb-1">{item.val}</span>
            <span className="text-[10px] font-bold text-brand-subtext tracking-wider uppercase">{item.label}</span>
          </Card>
        ))}
      </div>

      <div className="space-y-6">
        <Card>
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-sm text-brand-text flex items-center gap-2">
               观念分布
            </h3>
            {dominantLevel && <div className="text-[10px] font-bold text-brand-primary bg-brand-primary/10 px-3 py-1 rounded-full">主流: {dominantLevel.name}</div>}
          </div>
          <div className="flex items-center gap-4">
            <div className="h-[160px] w-1/2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={levelCounts} cx="50%" cy="50%" innerRadius={40} outerRadius={60} paddingAngle={8} dataKey="value" stroke="none" cornerRadius={6}>
                    {levelCounts.map((_, index) => <Cell key={`cell-${index}`} fill={PIE_COLORS[index]} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-1/2 flex flex-col gap-2.5">
              {levelCounts.map((l, i) => (
                <div key={i} className="flex items-center justify-between text-[11px] font-medium">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ background: PIE_COLORS[i] }}></div>
                    <span className="text-brand-subtext">{l.name}</span>
                  </div>
                  <span className="text-brand-text font-bold">{l.value}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-sm text-brand-text flex items-center gap-2">
               核心产品次数
            </h3>
            <Box size={16} className="text-brand-subtext" />
          </div>
          <div className="space-y-5">
            {productCounts.map(([name, count]) => (
              <div key={name} className="space-y-2">
                <div className="flex justify-between text-[11px] font-bold">
                  <span className="text-brand-text capitalize">{name}</span>
                  <span className="text-brand-primary font-semibold">{count} 次提及</span>
                </div>
                <div className="h-1.5 w-full bg-brand-light rounded-full overflow-hidden">
                  <div className="h-full bg-brand-primary rounded-full transition-all duration-500" style={{ width: `${visits.length ? (count / visits.length) * 100 : 0}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-sm text-brand-text flex items-center gap-2">
               疾病领域覆盖次数
            </h3>
            <Activity size={16} className="text-brand-secondary" />
          </div>
          <div className="space-y-5">
            {diseaseAreaCounts.map(([name, count]) => (
              <div key={name} className="space-y-2">
                <div className="flex justify-between text-[11px] font-bold">
                  <span className="text-brand-text uppercase">{name}</span>
                  <span className="text-brand-secondary font-semibold">{count} 次覆盖</span>
                </div>
                <div className="h-1.5 w-full bg-brand-light rounded-full overflow-hidden">
                  <div className="h-full bg-brand-secondary rounded-full transition-all duration-500" style={{ width: `${visits.length ? (count / visits.length) * 100 : 0}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};