import { cn } from '@/lib/utils/cn';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'primary';
  size?: 'sm' | 'md';
  dot?: boolean;
}

export function Badge({
  className,
  variant = 'default',
  size = 'md',
  dot = false,
  children,
  ...props
}: BadgeProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center font-medium rounded-full',
        {
          'bg-surface-3 text-text-secondary': variant === 'default',
          'bg-accent-green-muted text-accent-green': variant === 'success',
          'bg-accent-amber-muted text-accent-amber': variant === 'warning',
          'bg-accent-red-muted text-accent-red': variant === 'error',
          'bg-accent-blue-muted text-accent-blue': variant === 'info',
          'bg-accent-primary-muted text-accent-primary': variant === 'primary',
        },
        {
          'px-1.5 py-0.5 text-[10px] gap-1': size === 'sm',
          'px-2.5 py-0.5 text-xs gap-1.5': size === 'md',
        },
        className
      )}
      {...props}
    >
      {dot && (
        <div
          className={cn('w-1.5 h-1.5 rounded-full', {
            'bg-text-secondary': variant === 'default',
            'bg-accent-green': variant === 'success',
            'bg-accent-amber': variant === 'warning',
            'bg-accent-red': variant === 'error',
            'bg-accent-blue': variant === 'info',
            'bg-accent-primary': variant === 'primary',
          })}
        />
      )}
      {children}
    </div>
  );
}
