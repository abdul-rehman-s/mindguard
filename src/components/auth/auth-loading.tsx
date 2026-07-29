'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Shield } from 'lucide-react';
import { MindGuardSplashLogo } from '@/components/branding/mindguard-logo';
import { loadingMessages } from './auth-animations';
import { useEffect, useState, useRef, useCallback } from 'react';

/** Premium auth loading screen — never show blank screens */
export function AuthLoadingScreen({ message }: { message?: string }) {
  const [currentMessage, setCurrentMessage] = useState(message || loadingMessages[0]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearRotation = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (message) {
      clearRotation();
      return clearRotation;
    }
    // Start rotation for loading messages
    clearRotation();
    intervalRef.current = setInterval(() => {
      setCurrentMessage(loadingMessages[Math.floor(Math.random() * loadingMessages.length)]);
    }, 2500);
    return clearRotation;
  }, [message, clearRotation]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950">
      {/* Background glow */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-emerald-500/[0.04] blur-[120px]" />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-6">
        <MindGuardSplashLogo />

        <div className="flex flex-col items-center gap-3">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 ring-1 ring-emerald-500/15"
          >
            <Loader2 className="h-5 w-5 animate-spin text-emerald-400" />
          </motion.div>

          <AnimatePresence mode="wait">
            <motion.p
              key={currentMessage}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.3 }}
              className="text-sm text-zinc-400"
            >
              {currentMessage}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

/** Auth error state — friendly, not technical */
export function AuthErrorState({
  title,
  message,
  onRetry,
  onBack,
}: {
  title: string;
  message: string;
  onRetry?: () => void;
  onBack?: () => void;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950">
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[400px] w-[400px] rounded-full bg-red-500/[0.03] blur-[100px]" />
      </div>

      <div className="relative z-10 w-full max-w-md px-4">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-zinc-800/40 bg-zinc-900/60 backdrop-blur-xl p-8 text-center"
        >
          {/* Error icon */}
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/10 ring-1 ring-red-500/15">
            <Shield className="h-6 w-6 text-red-400" />
          </div>

          <h3 className="text-lg font-bold text-zinc-100 mb-2">{title}</h3>
          <p className="text-sm text-zinc-400 leading-relaxed mb-6">{message}</p>

          <div className="flex gap-3 justify-center">
            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="cursor-pointer rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition-all"
              >
                Try again
              </button>
            )}
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="cursor-pointer rounded-xl border border-zinc-700/30 bg-zinc-800/40 px-5 py-2.5 text-sm font-medium text-zinc-300 hover:text-zinc-200 hover:bg-zinc-800/60 transition-all"
              >
                Go back
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
