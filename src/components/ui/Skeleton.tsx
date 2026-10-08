import React from 'react';

interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '' }) => {
  return (
    <div
      className={`rounded-xl bg-white/[0.04] border border-white/[0.06] shimmer-active ${className}`}
    />
  );
};

export const MovieCardSkeleton: React.FC = () => {
  return (
    <div className="rounded-xl bg-[#111113] p-1.5 border border-white/[0.08]">
      <Skeleton className="aspect-[2/3] w-full rounded-lg" />
      <div className="mt-2 px-1 pb-1 space-y-1.5">
        <Skeleton className="h-3.5 w-3/4 rounded" />
        <Skeleton className="h-3 w-1/2 rounded" />
      </div>
    </div>
  );
};
