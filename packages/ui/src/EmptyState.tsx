import { ReactNode, ElementType } from 'react';
import { LinkButton } from './LinkButton';

export interface EmptyStateProps {
  message: string;
  actionLabel?: string;
  actionHref?: string;
  linkComponent?: ElementType;
  children?: ReactNode;
}

export function EmptyState({ message, actionLabel, actionHref, linkComponent, children }: EmptyStateProps) {
  return (
    <div className="text-center py-12">
      <p className="text-gray-500">{message}</p>
      {actionLabel && actionHref && (
        <LinkButton as={linkComponent} href={actionHref} className="mt-2">{actionLabel}</LinkButton>
      )}
      {children}
    </div>
  );
}
