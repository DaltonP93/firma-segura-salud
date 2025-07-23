
import React, { Suspense, memo } from 'react';
import LoadingSpinner from '@/components/layout/LoadingSpinner';

interface LazyWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const LazyWrapper = memo(({ children, fallback }: LazyWrapperProps) => {
  return (
    <Suspense fallback={fallback || <LoadingSpinner />}>
      {children}
    </Suspense>
  );
});

LazyWrapper.displayName = 'LazyWrapper';

export default LazyWrapper;
