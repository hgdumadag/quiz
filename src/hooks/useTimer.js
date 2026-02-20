import { useState, useEffect, useRef, useCallback } from 'react';
import { TIMER_WARNINGS } from '../utils/constants.js';
import { formatTime } from '../utils/helpers.js';

/**
 * useTimer - countdown timer hook.
 *
 * @param {number|null} initialSeconds  Starting value in seconds (null = no timer).
 * @param {object}      options
 * @param {function}    [options.onTenMinWarning]  Called once when <= 10 min remain.
 * @param {function}    [options.onTwoMinWarning]  Called once when <= 2 min remain.
 * @param {function}    [options.onExpiry]          Called once when time reaches 0.
 * @param {boolean}     [options.enabled=true]      Whether the timer is running.
 *
 * @returns {{ timeRemaining: number|null, isWarning: boolean, isCritical: boolean, formattedTime: string }}
 */
export function useTimer(initialSeconds, options = {}) {
  const {
    onTenMinWarning,
    onTwoMinWarning,
    onExpiry,
    enabled = true,
  } = options;

  const [timeRemaining, setTimeRemaining] = useState(initialSeconds);

  // Track which callbacks have already fired so we only call them once
  const firedTenMin = useRef(false);
  const firedTwoMin = useRef(false);
  const firedExpiry = useRef(false);

  // Keep callback refs up to date without re-triggering the effect
  const cbTenMin = useRef(onTenMinWarning);
  const cbTwoMin = useRef(onTwoMinWarning);
  const cbExpiry = useRef(onExpiry);

  useEffect(() => { cbTenMin.current = onTenMinWarning; }, [onTenMinWarning]);
  useEffect(() => { cbTwoMin.current = onTwoMinWarning; }, [onTwoMinWarning]);
  useEffect(() => { cbExpiry.current = onExpiry; }, [onExpiry]);

  // Reset when initialSeconds changes (e.g., new exam started)
  const prevInitial = useRef(initialSeconds);
  useEffect(() => {
    setTimeRemaining(initialSeconds);
    // Only reset fired flags when starting a brand new timer (null → value),
    // not when syncing an ongoing countdown from an external source.
    if (prevInitial.current == null && initialSeconds != null) {
      firedTenMin.current = false;
      firedTwoMin.current = false;
      firedExpiry.current = false;
    }
    prevInitial.current = initialSeconds;
  }, [initialSeconds]);

  // Core interval
  useEffect(() => {
    if (!enabled || timeRemaining == null || timeRemaining <= 0) return;

    const id = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev == null || prev <= 0) return prev;
        const next = prev - 1;

        // 10-minute warning
        if (
          !firedTenMin.current &&
          next <= TIMER_WARNINGS.TEN_MINUTES &&
          next > 0
        ) {
          firedTenMin.current = true;
          cbTenMin.current?.();
        }

        // 2-minute warning
        if (
          !firedTwoMin.current &&
          next <= TIMER_WARNINGS.TWO_MINUTES &&
          next > 0
        ) {
          firedTwoMin.current = true;
          cbTwoMin.current?.();
        }

        // Expiry
        if (next <= 0 && !firedExpiry.current) {
          firedExpiry.current = true;
          cbExpiry.current?.();
        }

        return next;
      });
    }, 1000);

    return () => clearInterval(id);
  }, [enabled, timeRemaining]);

  const isWarning = timeRemaining != null && timeRemaining <= TIMER_WARNINGS.TWO_MINUTES && timeRemaining > 0;
  const isCritical = timeRemaining != null && timeRemaining <= 10 && timeRemaining > 0;
  const formattedTime = formatTime(timeRemaining);

  return { timeRemaining, isWarning, isCritical, formattedTime };
}

export default useTimer;
