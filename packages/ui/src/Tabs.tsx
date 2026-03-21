export interface TabOption {
  key: string;
  label: string;
}

export interface TabsProps {
  tabs: TabOption[];
  active: string;
  onChange: (key: string) => void;
  color?: string;
}

const colorMap: Record<string, string> = {
  green: 'bg-green-600',
  red: 'bg-red-600',
  blue: 'bg-blue-600',
  violet: 'bg-violet-500',
};

export function Tabs({ tabs, active, onChange, color = 'green' }: TabsProps) {
  const activeClass = colorMap[color] || colorMap.green;
  return (
    <div className="flex gap-2 mb-6 border-b-2 border-gray-200 pb-2">
      {tabs.map(({ key, label }) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          className={`px-5 py-2 border-none rounded-t-md cursor-pointer text-[0.9rem] font-medium transition-colors ${
            active === key ? `${activeClass} text-white` : 'bg-gray-100 text-gray-700'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
