'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface AuthButtonProps {
  loading?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'submit' | 'button';
  variant?: 'primary' | 'secondary';
  className?: string;
  disabled?: boolean;
  loadingMessages?: readonly string[];
}

export function AuthButton({
  loading = false,
  children,
  onClick,
  type = 'submit',
  variant = 'primary',
  className,
  disabled = false,
  loadingMessages: messages = ['Preparing your workspace\u2026', 'Almost there\u2026'],
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
      clearRotation();
      intervalRef.current = setInterval(() => {
        setMessageIndex((prev) => (prev + 1) % messages.length);
      }, 2000);
    } else {
      clearRotation();
    }
    return clearRotation;
  }, [loading, clearRotation, messages]);

  // Reset message index when loading changes (outside effect to avoid cascading renders)
  const effectiveIndex = loading ? messageIndex : 0;

  return (
    <div className="space-y-2">
      <Button
        type={type}
        onClick={onClick}
        disabled={loading || disabled}
        className={cn(
          'h-12 w-full rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer',
          variant === 'primary'
            ? 'bg-gradient-to-b from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/20 hover:from-emerald-400 hover:to-emerald-500 hover:shadow-xl hover:shadow-emerald-500/25 active:from-emerald-600 active:to-emerald-700'
            : 'bg-zinc-800/50 text-zinc-300 border border-zinc-700/30 shadow-none hover:bg-zinc-800/70 hover:text-zinc-200',
          loading && 'opacity-80',
          className,
        )}
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            {messages[effectiveIndex]}
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
        'text-sm font-medium text-emerald-400/80 hover:text-emerald-400 transition-colors cursor-pointer',
        className,
      )}
    >
      {children}
    </button>
  );
}
