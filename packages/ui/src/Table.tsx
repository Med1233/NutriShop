import { ReactNode, TdHTMLAttributes, ThHTMLAttributes } from 'react';

export function Table({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className="overflow-x-auto">
      <table className={`w-full border-collapse text-sm table-fixed ${className}`}>
        {children}
      </table>
    </div>
  );
}

export function Th({ children, className = '', ...props }: ThHTMLAttributes<HTMLTableCellElement> & { children?: ReactNode }) {
  return (
    <th className={`text-start p-3 border-b-2 border-gray-200 font-semibold text-gray-700 text-[0.8rem] align-top ${className}`} {...props}>
      {children}
    </th>
  );
}

export function Td({ children, className = '', ...props }: TdHTMLAttributes<HTMLTableCellElement> & { children?: ReactNode }) {
  return (
    <td className={`text-start p-3 border-b border-gray-100 align-top ${className}`} {...props}>
      {children}
    </td>
  );
}
