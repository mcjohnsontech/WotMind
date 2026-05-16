import { cn } from '@/lib/utils/cn';
import { Inbox, type LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  className,
  size = 'md',
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'bg-surface-1 border border-border rounded-2xl text-center',
        {
          'py-8 px-4': size === 'sm',
          'py-12 px-6': size === 'md',
          'py-16 px-6': size === 'lg',
        },
        className
      )}
      role="status"
    >
      <div
        className={cn(
          'mx-auto rounded-2xl bg-surface-2 border border-border flex items-center justify-center',
          {
            'w-10 h-10 mb-2': size === 'sm',
            'w-14 h-14 mb-3': size === 'md',
            'w-16 h-16 mb-4': size === 'lg',
          }
        )}
      >
        <Icon
          className={cn('text-text-tertiary', {
            'w-4 h-4': size === 'sm',
            'w-5 h-5': size === 'md',
            'w-6 h-6': size === 'lg',
          })}
          aria-hidden="true"
        />
      </div>
      <h3
        className={cn('font-semibold text-text-primary mb-1', {
          'text-sm': size === 'sm',
          'text-base': size === 'md',
          'text-lg': size === 'lg',
        })}
      >
        {title}
      </h3>
      {description && (
        <p
          className={cn('text-text-secondary mx-auto', {
            'text-[12px] max-w-xs': size === 'sm',
            'text-[13px] max-w-sm': size === 'md',
            'text-sm max-w-md': size === 'lg',
          })}
        >
          {description}
        </p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
