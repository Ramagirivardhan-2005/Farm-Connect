import React from 'react';

export function Skeleton({ className = '', variant = 'rect' }) {
  const variantStyles = {
    circle: 'rounded-full',
    rect: 'rounded-xl',
    text: 'rounded h-4',
  }[variant] || 'rounded-xl';

  return (
    <div className={`animate-pulse bg-slate-200/80 ${variantStyles} ${className}`} />
  );
}

export function ChannelCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden p-4 space-y-3">
      <Skeleton className="h-36 w-full" />
      <div className="flex items-center gap-3">
        <Skeleton variant="circle" className="w-12 h-12 shrink-0" />
        <div className="space-y-2 flex-1">
          <Skeleton variant="text" className="w-3/4" />
          <Skeleton variant="text" className="w-1/2" />
        </div>
      </div>
      <div className="pt-2 flex justify-between items-center">
        <Skeleton variant="text" className="w-20" />
        <Skeleton className="w-24 h-9" />
      </div>
    </div>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden p-4 space-y-3">
      <Skeleton className="h-44 w-full" />
      <div className="space-y-2">
        <Skeleton variant="text" className="w-4/5" />
        <Skeleton variant="text" className="w-2/5" />
      </div>
      <div className="flex justify-between items-center pt-2">
        <Skeleton variant="text" className="w-16 h-6" />
        <Skeleton className="w-24 h-9" />
      </div>
    </div>
  );
}

export default Skeleton;
