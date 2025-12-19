import React from 'react';
import { Zap, ChevronRight, Lock, Sparkles, UserCheck } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

interface LoginViewProps {
  passcode: string;
  setPasscode: (code: string) => void;
  onLogin: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ passcode, setPasscode, onLogin }) => (
  <div className="min-h-screen flex items-center justify-center bg-brand-bg p-6 relative overflow-hidden">
    {/* Abstract Morandi Shapes */}
    <div className="absolute top-[-10%] right-[-10%] w-[300px] h-[300px] bg-brand-secondary opacity-20 rounded-full blur-[100px]"></div>
    <div className="absolute bottom-[5%] left-[-5%] w-[250px] h-[250px] bg-brand-accent opacity-30 rounded-full blur-[80px]"></div>
    
    <Card className="w-full max-w-sm py-12 px-8 text-center animate-scale-in">
      <div className="mb-10 flex flex-col items-center">
        <div className="w-20 h-20 rounded-[1.75rem] bg-brand-light flex items-center justify-center mb-6 shadow-inner-soft">
          <Zap size={32} className="text-brand-primary" fill="currentColor" />
        </div>
        <h1 className="text-2xl font-bold text-brand-text tracking-tight mb-2">CKM Pro</h1>
        <p className="text-brand-subtext text-xs font-medium tracking-wide">
          让专家观念管理更具艺术感
        </p>
      </div>
      
      <div className="space-y-6">
        <div className="relative group">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-subtext/60 transition-colors group-focus-within:text-brand-primary">
            <Lock size={18} />
          </div>
          <input 
            type="password" 
            placeholder="输入邀请码" 
            className="w-full pl-12 pr-4 py-4 rounded-[1.25rem] bg-brand-light border-0 focus:ring-2 focus:ring-brand-primary/20 transition-all text-center text-lg tracking-[0.5em] placeholder:tracking-normal placeholder:text-brand-subtext/40 outline-none"
            value={passcode}
            onChange={e => setPasscode(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && onLogin()}
          />
        </div>
        
        <Button onClick={onLogin} variant="primary" className="w-full group">
          进入工作台 <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>

      <div className="mt-12 flex items-center justify-center gap-2 opacity-30 grayscale">
         <div className="h-[1px] w-8 bg-brand-text"></div>
         <Sparkles size={14} />
         <div className="h-[1px] w-8 bg-brand-text"></div>
      </div>
    </Card>
    
    <div className="absolute bottom-10 left-0 right-0 text-center">
       <p className="text-[10px] text-brand-subtext font-bold uppercase tracking-[0.2em] opacity-50">
         Sophisticated Intel Management
       </p>
    </div>
  </div>
);