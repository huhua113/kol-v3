import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
}

export const Button: React.FC<ButtonProps> = ({ children, onClick, variant = 'primary', className = "", disabled=false, ...props }) => {
  const baseStyle = "px-4 py-2 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2 font-bold text-sm tracking-wide shadow-sm";
  const variants = {
    primary: "bg-gradient-to-r from-brand-primary to-indigo-600 text-white hover:shadow-lg hover:shadow-brand-primary/30",
    secondary: "bg-brand-secondary text-white hover:bg-sky-600",
    outline: "border-2 border-brand-primary text-brand-primary bg-transparent hover:bg-brand-primary/5",
    ghost: "bg-transparent text-brand-subtext hover:bg-brand-light shadow-none",
    danger: "bg-brand-accent text-white hover:bg-rose-600"
  };
  return (
    <button 
      disabled={disabled} 
      onClick={onClick} 
      className={`${baseStyle} ${variants[variant]} ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      {...props}
    >
      {children}
    </button>
  );
};