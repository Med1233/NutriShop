import { ReactNode } from 'react';

export interface BadgeProps {
  children: ReactNode;
  color?: string;
  bgColor?: string;
  className?: string;
}

export function Badge({
  children,
  color,
  bgColor,
  className = '',
}: BadgeProps) {
  return (
    <span
      className={`rounded-xl px-2.5 py-[3px] text-xs font-semibold ${className}`}
      style={{ color, background: bgColor }}
    >
      {children}
    </span>
  );
}

export function CategoryBadge({
  category,
  label,
  colors,
}: {
  category: string;
  label: string;
  colors: Record<string, string>;
}) {
  const color = colors[category] || '#6b7280';
  return (
    <Badge
      color={color}
      bgColor={color + '20'}
      className="text-[0.7rem] uppercase"
    >
      {label}
    </Badge>
  );
}

export function StatusBadge({
  status,
  label,
  colors,
}: {
  status: string;
  label: string;
  colors: Record<string, string>;
}) {
  const color = colors[status] || '#6b7280';
  return (
    <Badge color={color} bgColor={color + '20'} className="capitalize">
      {label}
    </Badge>
  );
}

export function ProviderBadge({ provider }: { provider: string }) {
  return (
    <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[0.7rem] font-semibold uppercase text-indigo-800">
      {provider}
    </span>
  );
}
