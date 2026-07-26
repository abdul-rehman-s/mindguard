// MindGuard Desktop — Timer Utilities (debounce, throttle, cancelable)

export type CancelableTimer = {
  cancel: () => void;
  isRunning: () => boolean;
};

export function debounce<T extends (...args: unknown[]) => void>(
  fn: T,
  delayMs: number
): T & CancelableTimer {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  const debounced = function (this: unknown, ...args: unknown[]) {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      timeoutId = null;
      fn.apply(this, args);
    }, delayMs);
  } as T & CancelableTimer;

  debounced.cancel = () => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };

  debounced.isRunning = () => timeoutId !== null;

  return debounced;
}

export function throttle<T extends (...args: unknown[]) => void>(
  fn: T,
  intervalMs: number
): T & CancelableTimer {
  let lastCallTime = 0;
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  const throttled = function (this: unknown, ...args: unknown[]) {
    const now = Date.now();
    const elapsed = now - lastCallTime;

    if (elapsed >= intervalMs) {
      lastCallTime = now;
      fn.apply(this, args);
    } else {
      const remaining = intervalMs - elapsed;
      if (timeoutId !== null) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        timeoutId = null;
        lastCallTime = Date.now();
        fn.apply(this, args);
      }, remaining);
    }
  } as T & CancelableTimer;

  throttled.cancel = () => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };

  throttled.isRunning = () => timeoutId !== null;

  return throttled;
}

export function scheduleAtInterval(
  fn: () => void | Promise<void>,
  intervalMs: number,
  runImmediately = false
): CancelableTimer {
  let intervalId: ReturnType<typeof setInterval> | null = null;
  let isExecuting = false;

  const execute = async () => {
    if (isExecuting) return;
    isExecuting = true;
    try {
      await fn();
    } finally {
      isExecuting = false;
    }
  };

  if (runImmediately) {
    execute();
  }

  intervalId = setInterval(execute, intervalMs);

  return {
    cancel: () => {
      if (intervalId !== null) {
        clearInterval(intervalId);
        intervalId = null;
      }
    },
    isRunning: () => intervalId !== null,
  };
}
