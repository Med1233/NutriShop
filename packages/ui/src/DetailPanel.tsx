import { ReactNode } from 'react';

export function DetailPanel({ children }: { children: ReactNode }) {
  return <div className="mt-3 p-4 bg-gray-50 rounded-lg">{children}</div>;
}

const colorClass: Record<string, string> = {
  green: 'text-green-600',
  blue: 'text-blue-500',
};

export interface ToggleButtonProps {
  expanded: boolean;
  onClick: () => void;
  children: ReactNode;
  color?: string;
}

export function ToggleButton({ expanded, onClick, children, color = 'green' }: ToggleButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`bg-transparent border-none ${colorClass[color] || colorClass.green} cursor-pointer text-sm font-medium pt-2 p-0`}
    >
      {expanded ? '\u25B2' : '\u25BC'} {children}
    </button>
  );
}
