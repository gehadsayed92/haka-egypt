import { cn } from '@/lib/utils';
import { HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {}

function Card({ className, ...props }: CardProps) {
  return (
    <div
      className={cn('bg-white rounded-xl shadow-sm border border-gray-100', className)}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }: CardProps) {
  return <div className={cn('p-6 pb-0', className)} {...props} />;
}

function CardContent({ className, ...props }: CardProps) {
  return <div className={cn('p-6', className)} {...props} />;
}

function CardFooter({ className, ...props }: CardProps) {
  return (
    <div className={cn('p-6 pt-0 flex items-center', className)} {...props} />
  );
}

export { Card, CardHeader, CardContent, CardFooter };
