import { ReactNode, ElementType, ComponentPropsWithoutRef } from 'react';

export type LinkButtonVariant = 'primary' | 'outline' | 'ghost';

const variantClasses: Record<LinkButtonVariant, string> = {
  primary: 'bg-green-600 text-white hover:bg-green-700',
  outline: 'bg-white text-green-600 border border-green-600 hover:bg-green-50',
  ghost: 'text-green-600 font-medium',
};

export type LinkButtonProps<C extends ElementType = 'a'> = {
  as?: C;
  variant?: LinkButtonVariant;
  className?: string;
  children: ReactNode;
} & Omit<ComponentPropsWithoutRef<C>, 'as' | 'variant' | 'className' | 'children'>;

export function LinkButton<C extends ElementType = 'a'>({
  as,
  variant = 'primary',
  className = '',
  children,
  ...props
}: LinkButtonProps<C>) {
  const Component = as || 'a';
  return (
    <Component
      className={`inline-block no-underline font-semibold px-6 py-2.5 rounded-lg text-center transition-colors ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
}
