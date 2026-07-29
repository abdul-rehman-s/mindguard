'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { loadingMessages } from './auth-animations';

interface AuthButtonProps {
  loading?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'submit' | 'button';
  variant?: 'primary' | 'secondary';
  className?: string;
  disabled?: boolean;
}

export function AuthButton({
  loading = false,
  children,
  onClick,
  type = 'submit',
  variant = 'primary',
  className,
  disabled = false,
}: AuthButtonProps) {
  const [messageIndex, setMessageIndex] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearRotation = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (loading) {
      // Start rotation when loading begins
      clearRotation();
      intervalRef.current = setInterval(() => {
        setMessageIndex((prev) => (prev + 1) % loadingMessages.length);
      }, 2000);
    } else {
      clearRotation();
    }
    return clearRotation;
  }, [loading, clearRotation]);

  return (
    <div className="space-y-2">
      <Button
        type={type}
        onClick={onClick}
        disabled={loading || disabled}
        className={cn(
          'h-11 w-full rounded-xl text-sm font-semibold transition-all cursor-pointer',
          variant === 'primary'
            ? 'btn-glow bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 hover:shadow-xl hover:shadow-emerald-500/25'
            : 'bg-zinc-800/50 text-zinc-300 border border-zinc-700/30 shadow-none hover:bg-zinc-800/70 hover:text-zinc-200',
          loading && 'opacity-80',
          className,
        )}
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            {loadingMessages[messageIndex]}
          </span>
        ) : (
          children
        )}
      </Button>
    </div>
  );
}

/** Small text link used for auth form toggles */
export function AuthLink({
  children,
  onClick,
  className,
}: {
  children: React.ReactNode;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'text-sm text-zinc-500 hover:text-emerald-400 transition-colors cursor-pointer',
        className,
      )}
    >
      {children}
    </button>
  );
}
