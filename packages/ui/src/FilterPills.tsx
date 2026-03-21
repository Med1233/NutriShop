export interface FilterPillOption {
  key: string;
  label: string;
  color?: string;
}

export interface FilterPillsProps {
  options: FilterPillOption[];
  active: string;
  onChange: (key: string) => void;
}

export function FilterPills({ options, active, onChange }: FilterPillsProps) {
  return (
    <div className="flex gap-2 flex-wrap">
      {options.map(({ key, label, color }) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          className="px-4 py-1.5 border-none rounded-full cursor-pointer text-sm font-medium transition-colors"
          style={{
            background: active === key ? (color || '#16a34a') : '#f3f4f6',
            color: active === key ? '#fff' : '#374151',
          }}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
