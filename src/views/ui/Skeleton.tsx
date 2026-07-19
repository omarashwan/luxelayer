import { classNames } from '../../models/utils';

interface SkeletonProps {
  className?: string;
  rounded?: 'md' | 'lg' | 'xl' | '2xl' | 'full';
}

export function Skeleton({ className, rounded = 'lg' }: SkeletonProps) {
  const radius = {
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    '2xl': 'rounded-2xl',
    full: 'rounded-full',
  }[rounded];
  return <div className={classNames('skeleton', radius, className)} />;
}

export function ProductCardSkeleton() {
  return (
    <div className="card-luxe overflow-hidden p-0">
      <Skeleton className="aspect-[4/5] w-full" rounded="2xl" />
      <div className="space-y-3 p-5">
        <Skeleton className="h-3 w-20" rounded="full" />
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <div className="flex items-center justify-between pt-2">
          <Skeleton className="h-6 w-16" rounded="full" />
          <Skeleton className="h-9 w-9" rounded="full" />
        </div>
      </div>
    </div>
  );
}
