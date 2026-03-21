import { ReactNode } from 'react';

export function DetailPanel({ children }: { children: ReactNode }) {
  return <div className="mt-3 rounded-lg bg-gray-50 p-4">{children}</div>;
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

export function ToggleButton({
  expanded,
  onClick,
  children,
  color = 'green',
}: ToggleButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`border-none bg-transparent ${colorClass[color] || colorClass.green} cursor-pointer p-0 pt-2 text-sm font-medium`}
    >
      {expanded ? '\u25B2' : '\u25BC'} {children}
    </button>
  );
}
