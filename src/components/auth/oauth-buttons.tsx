'use client';

import { signIn } from 'next-auth/react';
import { cn } from '@/lib/utils';

/** Check if OAuth provider environment variables are configured */
function isOAuthConfigured(provider: 'google' | 'github'): boolean {
  if (typeof window === 'undefined') return false;
  // In production, these would be checked server-side
  // For now, check if the app has the provider configured
  // We'll expose this via a data attribute or env check
  return false; // Will be dynamically overridden
}

interface OAuthButtonsProps {
  mode: 'signup' | 'signin';
  className?: string;
}

export function OAuthButtons({ mode, className }: OAuthButtonsProps) {
  const action = mode === 'signup' ? 'Continue' : 'Sign in';

  // Check if any OAuth is available - we'll use a simple check
  // If both are unavailable, don't render anything
  const googleAvailable = typeof window !== 'undefined' && process.env.NEXT_PUBLIC_GOOGLE_OAUTH === 'true';
  const githubAvailable = typeof window !== 'undefined' && process.env.NEXT_PUBLIC_GITHUB_OAUTH === 'true';

  // If neither is configured, don't render at all
  if (!googleAvailable && !githubAvailable) {
    return null;
  }

  return (
    <div className={cn('flex gap-3', className)}>
      {googleAvailable && (
        <button
          type="button"
          onClick={() => signIn('google', { callbackUrl: '/' })}
          className="cursor-pointer flex flex-1 items-center justify-center gap-2 rounded-xl border border-zinc-800/40 bg-zinc-800/30 px-4 py-2.5 text-sm font-medium text-zinc-300 transition-all hover:border-zinc-700/40 hover:bg-zinc-800/50 hover:text-zinc-200 ring-1 ring-inset ring-white/[0.03] active:scale-[0.98]"
          aria-label={`${action} with Google`}
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08 1.92 3.28 4.74 3.28 8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          {action} with Google
        </button>
      )}
      {githubAvailable && (
        <button
          type="button"
          onClick={() => signIn('github', { callbackUrl: '/' })}
          className="cursor-pointer flex flex-1 items-center justify-center gap-2 rounded-xl border border-zinc-800/40 bg-zinc-800/30 px-4 py-2.5 text-sm font-medium text-zinc-300 transition-all hover:border-zinc-700/40 hover:bg-zinc-800/50 hover:text-zinc-200 ring-1 ring-inset ring-white/[0.03] active:scale-[0.98]"
          aria-label={`${action} with GitHub`}
        >
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.919.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
          </svg>
          {action} with GitHub
        </button>
      )}
    </div>
  );
}
