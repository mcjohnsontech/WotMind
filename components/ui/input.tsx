import { forwardRef } from 'react';
import { cn } from '@/lib/utils/cn';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-10 w-full rounded-md border border-border bg-surface-1 px-3 py-2 text-base text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-border-glow focus:border-transparent transition-all',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';

export { Input };
