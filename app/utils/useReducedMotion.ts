import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

/**
 * Tracks the OS-level "reduce motion" accessibility setting. Components
 * should skip or shrink purely decorative animation when this is true,
 * while keeping non-motion feedback (opacity change, color change)
 * intact -- per the spec: "unnecessary movement should be reduced while
 * meaningful feedback remains available."
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      if (mounted) setReduced(enabled);
    });
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', (enabled: boolean) => {
      setReduced(enabled);
    });
    return () => {
      mounted = false;
      subscription.remove();
    };
  }, []);

  return reduced;
}
