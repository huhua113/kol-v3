import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({ children, className = "", onClick }) => (
  <div 
    onClick={onClick}
    className={`bg-brand-card rounded-2xl shadow-sm border border-brand-border p-4 hover:shadow-md transition-shadow duration-200 ${className}`}
  >
    {children}
  </div>
);