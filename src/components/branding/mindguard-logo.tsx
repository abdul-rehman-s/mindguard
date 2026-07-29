'use client';

import { cn } from '@/lib/utils';
import Image from 'next/image';

type LogoSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

const sizeMap: Record<LogoSize, { container: string; img: number }> = {
  xs: { container: 'h-5 w-5', img: 20 },
  sm: { container: 'h-7 w-7', img: 28 },
  md: { container: 'h-9 w-9', img: 36 },
  lg: { container: 'h-12 w-12', img: 48 },
  xl: { container: 'h-16 w-16', img: 64 },
};

interface MindGuardLogoProps {
  size?: LogoSize;
  showText?: boolean;
  collapsed?: boolean;
  className?: string;
}

export function MindGuardLogo({ size = 'md', showText = true, collapsed = false, className }: MindGuardLogoProps) {
  const s = sizeMap[size];

  return (
    <div className={cn('flex items-center gap-2.5 overflow-hidden', collapsed && 'justify-center w-full', className)}>
      <div className={cn('relative shrink-0 rounded-lg overflow-hidden', s.container)}>
        <Image
          src="/logo.png"
          alt="MindGuard Logo"
          width={s.img}
          height={s.img}
          className="object-contain"
          priority
        />
      </div>
      {showText && !collapsed && (
        <span className={cn(
          'font-semibold tracking-tight text-zinc-100 whitespace-nowrap overflow-hidden',
          size === 'xs' ? 'text-[11px]' : size === 'sm' ? 'text-[12px]' : size === 'md' ? 'text-[13px]' : size === 'lg' ? 'text-sm' : 'text-base'
        )}>
          MindGuard
        </span>
      )}
    </div>
  );
}

/** Splash/loading screen logo */
export function MindGuardSplashLogo({ className }: { className?: string }) {
  return (
    <div className={cn('flex flex-col items-center gap-4', className)}>
      <div className="relative h-14 w-14 rounded-xl overflow-hidden shadow-lg shadow-emerald-500/20">
        <Image
          src="/logo.png"
          alt="MindGuard Logo"
          width={56}
          height={56}
          className="object-contain"
          priority
        />
      </div>
      <div className="flex flex-col items-center gap-1">
        <span className="text-lg font-bold tracking-tight text-zinc-100">MindGuard AI</span>
        <span className="text-xs text-zinc-500">Protect Your Attention</span>
      </div>
    </div>
  );
}

/** Landing page hero logo */
export function MindGuardHeroLogo({ className }: { className?: string }) {
  return (
    <div className={cn('flex flex-col items-center', className)}>
      <div className="relative h-20 w-20 sm:h-24 sm:w-24 rounded-2xl overflow-hidden pulse-glow">
        <Image
          src="/logo.png"
          alt="MindGuard Logo"
          width={96}
          height={96}
          className="object-contain"
          priority
        />
      </div>
    </div>
  );
}
