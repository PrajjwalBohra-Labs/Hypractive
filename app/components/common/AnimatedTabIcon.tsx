import React, { useEffect, useRef } from 'react';
import { Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useReducedMotion } from '@/utils/useReducedMotion';

interface AnimatedTabIconProps {
  name: keyof typeof Ionicons.glyphMap;
  color: string;
  size: number;
  focused: boolean;
}

/**
 * Tab bar icon with a barely-noticeable bounce when it becomes the
 * selected tab: 0.95 -> 1.05 -> 1.0. Fully skipped when the system's
 * reduce-motion setting is on -- this bounce is purely decorative, so
 * there's nothing functional lost by turning it off.
 */
export function AnimatedTabIcon({ name, color, size, focused }: AnimatedTabIconProps) {
  const scale = useRef(new Animated.Value(1)).current;
  const wasFocused = useRef(focused);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (focused && !wasFocused.current && !reducedMotion) {
      scale.setValue(0.95);
      Animated.sequence([
        Animated.spring(scale, { toValue: 1.05, useNativeDriver: true, speed: 40, bounciness: 6 }),
        Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 40, bounciness: 0 }),
      ]).start();
    }
    wasFocused.current = focused;
  }, [focused, scale, reducedMotion]);

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Ionicons name={name} size={size} color={color} />
    </Animated.View>
  );
}
