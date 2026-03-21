import { ReactNode, TdHTMLAttributes, ThHTMLAttributes } from 'react';

export function Table({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className="overflow-x-auto">
      <table
        className={`w-full table-fixed border-collapse text-sm ${className}`}
      >
        {children}
      </table>
    </div>
  );
}

export function Th({
  children,
  className = '',
  ...props
}: ThHTMLAttributes<HTMLTableCellElement> & { children?: ReactNode }) {
  return (
    <th
      className={`border-b-2 border-gray-200 p-3 text-start align-top text-[0.8rem] font-semibold text-gray-700 ${className}`}
      {...props}
    >
      {children}
    </th>
  );
}

export function Td({
  children,
  className = '',
  ...props
}: TdHTMLAttributes<HTMLTableCellElement> & { children?: ReactNode }) {
  return (
    <td
      className={`border-b border-gray-100 p-3 text-start align-top ${className}`}
      {...props}
    >
      {children}
    </td>
  );
}
