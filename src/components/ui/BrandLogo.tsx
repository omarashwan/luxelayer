import { Feather } from 'lucide-react';
import { classNames } from '../../models/utils';

type BrandLogoProps = {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'hero';
  feather?: boolean;
};

const sizeClasses: Record<NonNullable<BrandLogoProps['size']>, string> = {
  sm: 'text-[1.1rem] tracking-[0.28em]',
  md: 'text-[1.55rem] tracking-[0.3em]',
  lg: 'text-[2.25rem] tracking-[0.32em]',
  hero: 'text-[clamp(2.4rem,6vw,5.2rem)] tracking-[0.26em]',
};

const featherClasses: Record<NonNullable<BrandLogoProps['size']>, string> = {
  sm: 'mt-1 h-3.5 w-3.5',
  md: 'mt-1.5 h-4 w-4',
  lg: 'mt-2 h-6 w-6',
  hero: 'mt-2 h-12 w-12 sm:h-14 sm:w-14',
};

export function BrandLogo({ className, size = 'md', feather = true }: BrandLogoProps) {
  return (
    <div className={classNames('inline-flex flex-col items-center leading-none', className)}>
      <span
        className={classNames(
          'bg-gradient-to-r from-[#b97a6d] via-[#e5c3b5] to-[#c58a74] bg-clip-text font-light text-transparent',
          sizeClasses[size],
        )}
      >
        LUXELAYER
      </span>
      {feather && <Feather className={classNames('text-[#c58a74]', featherClasses[size])} strokeWidth={1.45} />}
    </div>
  );
}