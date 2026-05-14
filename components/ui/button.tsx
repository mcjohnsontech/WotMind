import { forwardRef } from 'react';
import { cn } from '@/lib/utils/cn';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-glow disabled:opacity-50 disabled:cursor-not-allowed',
          {
            'bg-border-glow text-surface-0 hover:bg-blue-500': variant === 'primary',
            'bg-surface-2 text-text-primary hover:bg-surface-2/80 border border-border':
              variant === 'secondary',
            'bg-transparent text-text-secondary hover:bg-surface-2 hover:text-text-primary':
              variant === 'ghost',
            'bg-accent-red text-white hover:bg-red-600': variant === 'danger',
          },
          {
            'px-3 py-1.5 text-sm': size === 'sm',
            'px-4 py-2 text-base': size === 'md',
            'px-6 py-3 text-lg': size === 'lg',
          },
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';

export { Button };
