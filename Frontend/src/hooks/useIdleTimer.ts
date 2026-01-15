import { useEffect, useRef, useState, useCallback } from 'react';

interface UseIdleTimerOptions {
  timeout: number;           // Time before warning (ms)
  warningDuration: number;   // Warning countdown duration (ms)
  onIdle: () => void;
  onWarning?: () => void;
  active?: boolean;
}

export const useIdleTimer = ({
  timeout,
  warningDuration,
  onIdle,
  onWarning,
  active = true
}: UseIdleTimerOptions) => {
  const [showWarning, setShowWarning] = useState(false);
  const [countdown, setCountdown] = useState(Math.floor(warningDuration / 1000));
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const warningTimerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const clearAllTimers = useCallback(() => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
  }, []);

  const startIdleTimer = useCallback(() => {
    clearAllTimers();

    if (!active) return;

    // Set idle timer
    idleTimerRef.current = setTimeout(() => {
      setShowWarning(true);
      onWarning?.();
      
      // Start countdown
      let remaining = Math.floor(warningDuration / 1000);
      setCountdown(remaining);
      
      countdownIntervalRef.current = setInterval(() => {
        remaining -= 1;
        setCountdown(remaining);
        if (remaining <= 0) {
          clearInterval(countdownIntervalRef.current!);
        }
      }, 1000);

      // Set final logout timer
      warningTimerRef.current = setTimeout(() => {
        setShowWarning(false);
        onIdle();
      }, warningDuration);
    }, timeout);
  }, [timeout, warningDuration, onIdle, onWarning, active, clearAllTimers]);

  const stayActive = useCallback(() => {
    setShowWarning(false);
    setCountdown(Math.floor(warningDuration / 1000));
    startIdleTimer();
  }, [warningDuration, startIdleTimer]);

  const handleActivity = useCallback(() => {
    // Only reset if not showing warning (user activity should dismiss warning via stayActive button)
    if (!showWarning) {
      startIdleTimer();
    }
  }, [showWarning, startIdleTimer]);

  useEffect(() => {
    if (!active) {
      clearAllTimers();
      return;
    }

    const events = [
      'mousemove',
      'mousedown',
      'keypress',
      'DOMMouseScroll',
      'mousewheel',
      'touchmove',
      'MSPointerMove'
    ];

    // Attach listeners
    events.forEach(event => {
      window.addEventListener(event, handleActivity);
    });

    // Initial start (deferred)
    const initTimeout = setTimeout(startIdleTimer, 100);

    // Cleanup
    return () => {
      clearTimeout(initTimeout);
      clearAllTimers();
      events.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [active, handleActivity, startIdleTimer, clearAllTimers]);

  return { showWarning, countdown, stayActive };
};
