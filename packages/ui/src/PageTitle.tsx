import { ReactNode } from 'react';

const colorClasses: Record<string, string> = {
  default: '',
  blue: 'text-blue-500',
  red: 'text-red-600',
  violet: 'text-violet-500',
  green: 'text-green-600',
};

export function PageTitle({
  children,
  color = 'default',
}: {
  children: ReactNode;
  color?: string;
}) {
  return (
    <h1 className={`mb-6 text-2xl font-bold ${colorClasses[color] || ''}`}>
      {children}
    </h1>
  );
}
