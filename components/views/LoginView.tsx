import React from 'react';
import { Zap, ChevronRight, Lock, Sparkles } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

interface LoginViewProps {
  passcode: string;
  setPasscode: (code: string) => void;
  onLogin: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ passcode, setPasscode, onLogin }) => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-primary via-purple-600 to-brand-accent p-6 relative overflow-hidden">
    {/* Background Decorations */}
    <div className="absolute top-20 left-10 w-32 h-32 bg-white/10 rounded-full blur-3xl animate-pulse-slow"></div>
    <div className="absolute bottom-20 right-10 w-40 h-40 bg-brand-secondary/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
    
    <Card className="w-full max-w-sm text-center py-12 shadow-2xl border-none relative z-10 bg-white/95 backdrop-blur-xl">
      <div className="mb-8 flex justify-center relative">
        <div className="w-24 h-24 rounded-full bg-indigo-50 flex items-center justify-center animate-bounce-subtle">
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-brand-primary to-purple-500 flex items-center justify-center text-white shadow-lg shadow-brand-primary/40">
            <Zap size={36} fill="currentColor" className="drop-shadow-sm" />
          </div>
        </div>
        <Sparkles className="absolute top-0 right-[35%] text-brand-warning animate-spin-slow" size={20} />
      </div>
      
      <h1 className="text-3xl font-black text-brand-text mb-2 tracking-tight">CKM Pro</h1>
      <p className="text-brand-subtext mb-8 font-medium flex items-center justify-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-brand-success"></span>
        高效管理专家观念
        <span className="w-1.5 h-1.5 rounded-full bg-brand-success"></span>
      </p>
      
      <div className="relative mb-6 group px-6">
        <div className="absolute left-10 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-primary transition-colors">
            <Lock size={18} />
        </div>
        <input 
          type="password" 
          placeholder="输入通行码" 
          className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-brand-light bg-brand-bg text-center text-lg tracking-widest focus:outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 transition-all placeholder:tracking-normal placeholder:text-gray-400"
          value={passcode}
          onChange={e => setPasscode(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && onLogin()}
        />
      </div>
      
      <div className="px-6">
        <Button onClick={onLogin} className="w-full py-3.5 text-base shadow-xl shadow-brand-primary/20 rounded-xl group relative overflow-hidden">
          <span className="relative z-10 flex items-center justify-center gap-2">
            进入系统 <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </span>
        </Button>
      </div>
    </Card>
    
    <p className="absolute bottom-6 text-white/50 text-xs font-medium tracking-wide">
        Powered by Mobile-First Logic
    </p>
  </div>
);