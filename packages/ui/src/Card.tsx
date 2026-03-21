import { ReactNode } from 'react';

export type CardVariant = 'default' | 'form' | 'muted';

const variantClasses: Record<CardVariant, string> = {
  default: 'bg-white border border-gray-200',
  form: 'bg-gray-50 border border-gray-200',
  muted: 'bg-gray-50 border border-gray-200',
};

export interface CardProps {
  children: ReactNode;
  className?: string;
  variant?: CardVariant;
}

export function Card({ children, className = '', variant = 'default' }: CardProps) {
  return (
    <div className={`rounded-[10px] p-5 ${variantClasses[variant]} ${className}`}>
      {children}
    </div>
  );
}

export function CardHeader({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-lg font-bold m-0 text-gray-900">{title}</h2>
      {children}
    </div>
  );
}
