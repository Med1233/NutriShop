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

export function Card({
  children,
  className = '',
  variant = 'default',
}: CardProps) {
  return (
    <div
      className={`rounded-[10px] p-5 ${variantClasses[variant]} ${className}`}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  children,
}: {
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <h2 className="m-0 text-lg font-bold text-gray-900">{title}</h2>
      {children}
    </div>
  );
}
