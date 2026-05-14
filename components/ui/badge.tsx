import { cn } from '@/lib/utils/cn';

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
}

export function Badge({
  className,
  variant = 'default',
  ...props
}: BadgeProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        {
          'bg-surface-2 text-text-primary': variant === 'default',
          'bg-accent-green/20 text-accent-green': variant === 'success',
          'bg-accent-amber/20 text-accent-amber': variant === 'warning',
          'bg-accent-red/20 text-accent-red': variant === 'error',
          'bg-border-glow/20 text-border-glow': variant === 'info',
        },
        className
      )}
      {...props}
    />
  );
}
