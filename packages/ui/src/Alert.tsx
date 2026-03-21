import { ReactNode } from 'react';

export type AlertVariant = 'error' | 'success';

const variants: Record<AlertVariant, string> = {
  error: 'bg-red-50 text-red-600',
  success: 'bg-green-50 text-green-600',
};

export interface AlertProps {
  children: ReactNode;
  variant?: AlertVariant;
  className?: string;
}

export function Alert({
  children,
  variant = 'error',
  className = '',
}: AlertProps) {
  return (
    <div
      role="alert"
      className={`mb-4 rounded-md p-3 text-sm ${variants[variant]} ${className}`}
    >
      {children}
    </div>
  );
}
