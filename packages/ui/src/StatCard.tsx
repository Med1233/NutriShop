import { ReactNode } from 'react';

export interface StatCardProps {
  value: ReactNode;
  label: string;
  color?: string;
}

export function StatCard({ value, label, color }: StatCardProps) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-[10px] border border-gray-200 bg-white p-4">
      <span
        className="text-2xl font-extrabold"
        style={{ color: color || '#111827' }}
      >
        {value}
      </span>
      <span className="text-[0.8rem] font-medium text-gray-500">{label}</span>
    </div>
  );
}

const colsClass: Record<number, string> = {
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
  5: 'grid-cols-5',
};

export function StatGrid({
  cols = 4,
  children,
}: {
  cols?: number;
  children: ReactNode;
}) {
  return (
    <div className={`grid ${colsClass[cols] || 'grid-cols-4'} mb-6 gap-4`}>
      {children}
    </div>
  );
}
