import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'outline' | 'ghost' | 'neutral';
}

export const Button: React.FC<ButtonProps> = ({ children, onClick, variant = 'primary', className = "", disabled=false, ...props }) => {
  const baseStyle = "px-6 py-3.5 rounded-[1.25rem] transition-all duration-300 active:scale-95 flex items-center justify-center gap-2 font-medium text-sm tracking-tight select-none";
  
  const variants = {
    primary: "bg-brand-primary text-white shadow-soft",
    secondary: "bg-brand-secondary text-white shadow-soft",
    accent: "bg-brand-accent text-white shadow-soft",
    neutral: "bg-brand-neutral text-brand-text",
    outline: "border border-brand-border text-brand-subtext bg-white hover:bg-brand-light",
    ghost: "bg-transparent text-brand-subtext hover:text-brand-text"
  };

  return (
    <button 
      disabled={disabled} 
      onClick={onClick} 
      className={`${baseStyle} ${variants[variant]} ${className} ${disabled ? 'opacity-40 cursor-not-allowed grayscale' : ''}`}
      {...props}
    >
      {children}
    </button>
  );
};