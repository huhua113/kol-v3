import React from 'react';
import { BarChart3, Users, FileText } from 'lucide-react';
import { ViewTab } from '../../types';

interface BottomNavProps {
  activeTab: ViewTab;
  setActiveTab: (tab: ViewTab) => void;
}

const navItems = [
  { id: 'list', icon: Users, label: '专家' },
  { id: 'dashboard', icon: BarChart3, label: '概览' },
  { id: 'competitors', icon: FileText, label: '详情' }
];

const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab }) => {
  return (
    <nav className="bg-white/95 backdrop-blur-xl border-t border-brand-border h-24 flex items-center justify-around fixed bottom-0 max-w-sm w-full z-40 px-6 rounded-t-[2.5rem] shadow-[0_-8px_30px_rgb(0,0,0,0.04)]">
      {navItems.map(tab => (
        <button key={tab.id} onClick={() => setActiveTab(tab.id as ViewTab)}
          className={`flex flex-col items-center justify-center gap-1 transition-all duration-300 ${activeTab === tab.id ? 'text-brand-primary' : 'text-brand-subtext/50'}`}>
          <div className={`p-3 rounded-2xl transition-all ${activeTab === tab.id ? 'bg-blue-50' : ''}`}>
            <tab.icon size={22} strokeWidth={activeTab === tab.id ? 2.5 : 2} />
          </div>
          <span className="text-[10px] font-bold tracking-tight">{tab.label}</span>
        </button>
      ))}
    </nav>
  );
};

export default React.memo(BottomNav);
