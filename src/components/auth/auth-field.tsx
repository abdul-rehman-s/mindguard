'use client';

import { useState, useEffect, useRef, useId } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { getPasswordStrength, strengthConfig, fieldEntrance, errorEntrance } from './auth-animations';

interface AuthFieldProps {
  id: string;
  label: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  hint?: string;
  required?: boolean;
  showPasswordToggle?: boolean;
  showStrength?: boolean;
  autoComplete?: string;
  autoFocus?: boolean;
  /** Called when Enter is pressed — for advancing to next step in conversational flow */
  onSubmit?: () => void;
  /** Conversational placeholder shown when field is empty (e.g. "What should we call you?") */
  conversationalPlaceholder?: string;
}

export function AuthField({
  id,
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  hint,
  required = false,
  showPasswordToggle = false,
  showStrength = false,
  autoComplete,
  autoFocus = false,
  onSubmit,
  conversationalPlaceholder,
}: AuthFieldProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState(false);
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const uniqueId = useId();
  const inputType = showPasswordToggle ? (showPassword ? 'text' : 'password') : type;

  const strength = showStrength ? getPasswordStrength(value) : null;
  const config = strength ? strengthConfig[strength] : null;

  const isFloating = focused || value.length > 0;

  // Determine the effective placeholder:
  // - When field is empty and not focused: show conversational placeholder (if provided)
  // - When field is focused and floating: show regular placeholder (if provided)
  const effectivePlaceholder = !isFloating && conversationalPlaceholder
    ? conversationalPlaceholder
    : isFloating
      ? (placeholder || '')
      : '';

  // Auto-focus handling
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [autoFocus]);

  // Handle Enter key for auto-advance
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && onSubmit) {
      e.preventDefault();
      onSubmit();
    }
  };

  // Determine error state
  const hasError = !!(error && touched);

  // Build ARIA attributes
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  const strengthId = `${id}-strength`;

  const ariaDescribedBy = [
    hasError ? errorId : '',
    hint && !hasError ? hintId : '',
    showStrength && value.length > 0 ? strengthId : '',
  ].filter(Boolean).join(' ') || undefined;

  return (
    <motion.div
      variants={fieldEntrance}
      initial="hidden"
      animate="visible"
      exit="hidden"
      className="space-y-2"
    >
      <div className="relative group">
        {/* Floating label — smooth animation with Framer Motion */}
        <motion.label
          htmlFor={id}
          className={cn(
            'absolute left-4 z-10 pointer-events-none origin-left font-medium select-none',
            'transition-colors duration-300 ease-out',
            isFloating
              ? 'top-2.5 text-[11px] text-emerald-400/90'
              : 'top-[19px] text-base text-zinc-500',
            hasError && isFloating && 'text-red-400/80',
            hasError && !isFloating && 'text-red-400/60',
          )}
          animate={isFloating ? 'floating' : 'resting'}
          variants={{
            resting: {
              y: 0,
              scale: 1,
              transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] },
            },
            floating: {
              y: -2,
              scale: 0.98,
              transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] },
            },
          }}
        >
          {label}
          {required && <span className="text-emerald-400/50 ml-0.5">*</span>}
        </motion.label>

        {/* Input — h-14 with generous padding */}
        <Input
          ref={inputRef}
          id={id}
          type={inputType}
          placeholder={effectivePlaceholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={() => { setTouched(true); setFocused(false); }}
          onFocus={() => setFocused(true)}
          onKeyDown={handleKeyDown}
          required={required}
          autoComplete={autoComplete}
          aria-invalid={hasError || undefined}
          aria-describedby={ariaDescribedBy}
          className={cn(
            'w-full rounded-xl border bg-zinc-800/30 text-zinc-200 transition-all duration-300 ease-out',
            // Size — h-14 with more padding for comfortable input
            isFloating ? 'pt-7 pb-2 h-[64px] text-base' : 'h-[64px] text-base',
            'pl-4 pr-14',
            // Placeholder styling — conversational placeholder is more subtle
            'placeholder:text-zinc-600 placeholder:transition-colors placeholder:duration-300',
            conversationalPlaceholder && !isFloating && 'placeholder:text-zinc-500/70',
            // Default border
            'border-zinc-800/50',
            // Hover
            'hover:border-zinc-700/60',
            // Focus — prominent emerald ring with subtle glow
            'focus-visible:border-emerald-500/60 focus-visible:ring-2 focus-visible:ring-emerald-500/20',
            'focus-visible:shadow-[0_0_0_4px_rgba(16,185,129,0.08)]',
            // Error state
            hasError && 'border-red-400/40 hover:border-red-400/50 focus-visible:border-red-400/60 focus-visible:ring-red-400/20 focus-visible:shadow-[0_0_0_4px_rgba(248,113,113,0.08)]',
          )}
        />

        {/* Subtle focus glow effect behind the input */}
        <AnimatePresence>
          {focused && !hasError && (
            <motion.div
              className="absolute inset-0 rounded-xl pointer-events-none -z-10"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              style={{
                boxShadow: '0 0 24px 2px rgba(16, 185, 129, 0.06), 0 0 8px 0px rgba(16, 185, 129, 0.04)',
              }}
            />
          )}
        </AnimatePresence>

        {/* Password toggle */}
        {showPasswordToggle && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            className={cn(
              'absolute right-3.5 top-1/2 -translate-y-1/2 p-1 rounded-lg transition-all duration-200 cursor-pointer',
              'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-700/30',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/30',
            )}
          >
            {showPassword ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
          </button>
        )}
      </div>

      {/* Password strength indicator — more prominent */}
      <AnimatePresence>
        {showStrength && value.length > 0 && config && (
          <motion.div
            className="space-y-1.5"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="h-1.5 rounded-full bg-zinc-800/50 overflow-hidden">
              <motion.div
                className={cn('h-full rounded-full', config.color)}
                initial={{ width: 0 }}
                animate={{ width: strength === 'weak' ? '25%' : strength === 'fair' ? '50%' : strength === 'good' ? '75%' : '100%' }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>
            <p
              id={strengthId}
              className={cn(
                'text-[11px] font-medium transition-colors duration-300',
                strength === 'weak' ? 'text-red-400/90' : strength === 'fair' ? 'text-amber-400/90' : strength === 'good' ? 'text-emerald-400/90' : 'text-emerald-500',
              )}
              aria-live="polite"
            >
              {config.label}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hint text — more visible, better positioned */}
      {hint && !hasError && (
        <p
          id={hintId}
          className="text-[12px] text-zinc-500/90 leading-relaxed pl-0.5"
        >
          {hint}
        </p>
      )}

      {/* Error message — smoother animation, encouraging tone */}
      <AnimatePresence>
        {hasError && (
          <motion.p
            id={errorId}
            variants={errorEntrance}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="text-[12px] text-red-400/80 leading-relaxed pl-0.5"
            role="alert"
            aria-live="polite"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
