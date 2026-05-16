import { forwardRef } from 'react';
import { cn } from '@/lib/utils/cn';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  loading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary/50 focus-visible:ring-offset-1 focus-visible:ring-offset-surface-0 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer select-none',
          {
            'bg-accent-primary text-text-inverse hover:bg-accent-primary-hover shadow-sm hover:shadow-md active:scale-[0.98]':
              variant === 'primary',
            'bg-surface-2 text-text-primary hover:bg-surface-3 border border-border':
              variant === 'secondary',
            'bg-transparent text-text-secondary hover:bg-surface-2 hover:text-text-primary':
              variant === 'ghost',
            'bg-accent-red/10 text-accent-red hover:bg-accent-red/20 border border-accent-red/20':
              variant === 'danger',
            'bg-transparent text-text-primary border border-border hover:border-text-tertiary hover:bg-surface-2':
              variant === 'outline',
          },
          {
            'px-2 py-1 text-[11px] gap-1 rounded-md': size === 'xs',
            'px-3 py-1.5 text-xs gap-1.5': size === 'sm',
            'px-4 py-2 text-sm gap-2': size === 'md',
            'px-6 py-2.5 text-base gap-2': size === 'lg',
          },
          className
        )}
        {...props}
      >
        {loading && (
          <div className="w-3.5 h-3.5 border-2 border-current/30 border-t-current rounded-full animate-spin" />
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };
