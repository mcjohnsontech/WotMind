import { cn } from '@/lib/utils/cn';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Card({ className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-xl bg-surface-1 border border-border p-5 transition-all duration-200',
        className
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: CardProps) {
  return <div className={cn('mb-4', className)} {...props} />;
}

export function CardTitle({
  className,
  ...props
}: CardProps & { children: React.ReactNode }) {
  return (
    <h2
      className={cn('text-lg font-semibold text-text-primary tracking-tight', className)}
      {...props}
    />
  );
}

export function CardDescription({
  className,
  ...props
}: CardProps & { children: React.ReactNode }) {
  return (
    <p className={cn('text-sm text-text-secondary mt-1', className)} {...props} />
  );
}

export function CardContent({ className, ...props }: CardProps) {
  return <div className={cn('', className)} {...props} />;
}

export function CardFooter({ className, ...props }: CardProps) {
  return (
    <div className={cn('mt-4 flex items-center gap-2', className)} {...props} />
  );
}
