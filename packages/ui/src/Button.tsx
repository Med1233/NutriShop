import { ButtonHTMLAttributes, ReactNode } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
export type ButtonSize = 'xs' | 'sm' | 'md';

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-green-600 text-white border-none hover:bg-green-700',
  secondary: 'bg-blue-600 text-white border-none hover:bg-blue-700',
  danger: 'bg-transparent border border-red-500 text-red-500 hover:bg-red-50',
  ghost: 'bg-transparent border-none text-green-600 hover:underline p-0',
  outline: 'bg-transparent border border-gray-300 text-gray-700 hover:bg-gray-50',
};

const sizeClasses: Record<ButtonSize, string> = {
  xs: 'px-2.5 py-0.5 text-xs rounded',
  sm: 'px-4 py-1.5 text-sm rounded-md',
  md: 'px-6 py-2.5 text-base rounded-lg',
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
}

export function Button({ variant = 'primary', size = 'sm', className = '', children, ...props }: ButtonProps) {
  return (
    <button
      className={`cursor-pointer font-semibold transition-colors ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
