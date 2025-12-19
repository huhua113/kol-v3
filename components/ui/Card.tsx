import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  variant?: 'flat' | 'outline' | 'ghost';
}

export const Card: React.FC<CardProps> = ({ children, className = "", onClick, variant = 'flat' }) => (
  <div 
    onClick={onClick}
    className={`
      rounded-[2rem] p-5 transition-all duration-500 
      ${variant === 'flat' ? 'bg-white shadow-card border border-brand-border/30' : ''} 
      ${variant === 'outline' ? 'bg-transparent border border-brand-border/60' : ''}
      ${variant === 'ghost' ? 'bg-brand-light shadow-inner-soft' : ''}
      ${onClick ? 'active:scale-[0.98] cursor-pointer' : ''} 
      ${className}
    `}
  >
    {children}
  </div>
);