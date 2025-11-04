import React from 'react';
import { clsx } from 'clsx';

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
}

export default function PageContainer({
  children,
  className,
  maxWidth = '2xl',
}: PageContainerProps) {
  const maxWidthClasses = {
    sm: 'max-w-screen-sm',
    md: 'max-w-screen-md',
    lg: 'max-w-screen-lg',
    xl: 'max-w-screen-xl',
    '2xl': 'max-w-7xl',
    full: 'max-w-full',
  };

  return (
    <div className={clsx('min-h-screen bg-gray-50 dark:bg-gray-900')}>
      <div className={clsx('mx-auto px-4 sm:px-6 lg:px-8 py-8', maxWidthClasses[maxWidth], className)}>
        {children}
      </div>
    </div>
  );
}

