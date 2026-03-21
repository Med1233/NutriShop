import { ReactNode } from 'react';

export interface StatCardProps {
  value: ReactNode;
  label: string;
  color?: string;
}

export function StatCard({ value, label, color }: StatCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-[10px] p-4 flex flex-col items-center gap-1">
      <span className="text-2xl font-extrabold" style={{ color: color || '#111827' }}>{value}</span>
      <span className="text-[0.8rem] text-gray-500 font-medium">{label}</span>
    </div>
  );
}

const colsClass: Record<number, string> = {
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
  5: 'grid-cols-5',
};

export function StatGrid({ cols = 4, children }: { cols?: number; children: ReactNode }) {
  return (
    <div className={`grid ${colsClass[cols] || 'grid-cols-4'} gap-4 mb-6`}>
      {children}
    </div>
  );
}
