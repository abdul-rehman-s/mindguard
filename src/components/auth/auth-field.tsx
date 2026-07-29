'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
}: AuthFieldProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState(false);
  const inputType = showPasswordToggle ? (showPassword ? 'text' : 'password') : type;

  const strength = showStrength ? getPasswordStrength(value) : null;
  const config = strength ? strengthConfig[strength] : null;

  return (
    <motion.div variants={fieldEntrance} initial="hidden" animate="visible" exit="hidden" className="space-y-1.5">
      <Label htmlFor={id} className="text-xs font-medium text-zinc-400">
        {label}
      </Label>
      <div className="relative">
        <Input
          id={id}
          type={inputType}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={() => setTouched(true)}
          required={required}
          autoComplete={autoComplete}
          autoFocus={autoFocus}
          className={cn(
            'h-11 rounded-xl border-zinc-800/50 bg-zinc-800/30 text-zinc-200 placeholder:text-zinc-600 transition-all duration-200',
            'focus-visible:border-emerald-500/50 focus-visible:ring-emerald-500/20',
            error && touched && 'border-red-500/40 focus-visible:border-red-500/50 focus-visible:ring-red-500/20',
          )}
        />
        {showPasswordToggle && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 transition-colors hover:text-zinc-300 cursor-pointer"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}
      </div>

      {/* Password strength indicator */}
      {showStrength && value.length > 0 && config && (
        <div className="space-y-1">
          <div className="h-1 rounded-full bg-zinc-800/50 overflow-hidden">
            <motion.div
              className={cn('h-full rounded-full', config.color)}
              initial={{ width: 0 }}
              animate={{ width: strength === 'weak' ? '25%' : strength === 'fair' ? '50%' : strength === 'good' ? '75%' : '100%' }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>
          <p className={cn(
            'text-[11px] font-medium',
            strength === 'weak' ? 'text-red-400' : strength === 'fair' ? 'text-amber-400' : 'text-emerald-400',
          )}>
            {config.label}
          </p>
        </div>
      )}

      {/* Hint text */}
      {hint && !error && (
        <p className="text-[11px] text-zinc-500">{hint}</p>
      )}

      {/* Error message */}
      <AnimatePresence>
        {error && touched && (
          <motion.p
            variants={errorEntrance}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="text-xs text-red-400/90"
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
