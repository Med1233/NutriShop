import {
  InputHTMLAttributes,
  TextareaHTMLAttributes,
  SelectHTMLAttributes,
  ReactNode,
} from 'react';

const baseInput =
  'border border-gray-300 rounded-md text-[0.9rem] w-full box-border focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500';

export function Input({
  className = '',
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={`p-2.5 ${baseInput} ${className}`} {...props} />;
}

export function Textarea({
  className = '',
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={`resize-y p-2.5 ${baseInput} ${className}`}
      {...props}
    />
  );
}

export function Select({
  className = '',
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & { children: ReactNode }) {
  return (
    <select className={`p-2.5 ${baseInput} ${className}`} {...props}>
      {children}
    </select>
  );
}

export function FormField({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={htmlFor} className="text-sm font-medium">
        {label}
      </label>
      {children}
    </div>
  );
}

export function FormRow({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-3 gap-3">{children}</div>;
}
