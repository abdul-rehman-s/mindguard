"use client";

import { useRef, useEffect } from "react";
import { useMotionValue, useTransform, animate } from "framer-motion";
import { cn } from "@/lib/utils";

interface AnimatedNumberProps {
  value: number;
  className?: string;
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
}

/**
 * Shared animated number component.
 * Replaces 4 different AnimatedNumber/AnimNum implementations across the codebase.
 * Renders a <span> that animates from previous value to new value.
 * Uses aria-hidden during animation with a separate sr-only span for accessibility.
 */
export function AnimatedNumber({
  value,
  className,
  duration = 0.8,
  decimals = 0,
  prefix = "",
  suffix = "",
}: AnimatedNumberProps) {
  const motionVal = useMotionValue(0);
  const display = useTransform(motionVal, (v) =>
    decimals > 0 ? v.toFixed(decimals) : String(Math.round(v))
  );
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const controls = animate(motionVal, value, {
      duration,
      ease: [0.25, 0.1, 0.25, 1],
    });
    return controls.stop;
  }, [value, duration, motionVal]);

  useEffect(() => {
    const unsubscribe = display.on("change", (v) => {
      if (ref.current) {
        ref.current.textContent = `${prefix}${v}${suffix}`;
      }
    });
    return unsubscribe;
  }, [display, prefix, suffix]);

  return (
    <span className={cn("inline-flex items-baseline", className)}>
      <span ref={ref} aria-hidden="true">
        {prefix}{decimals > 0 ? value.toFixed(decimals) : Math.round(value)}{suffix}
      </span>
      <span className="sr-only">
        {prefix}{decimals > 0 ? value.toFixed(decimals) : Math.round(value)}{suffix}
      </span>
    </span>
  );
}
