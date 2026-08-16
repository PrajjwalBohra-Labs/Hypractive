import React, { useEffect, useRef } from 'react';
import { Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface AnimatedTabIconProps {
  name: keyof typeof Ionicons.glyphMap;
  color: string;
  size: number;
  focused: boolean;
}

/**
 * Tab bar icon with a barely-noticeable bounce when it becomes the
 * selected tab: 0.95 -> 1.05 -> 1.0. The goal is "that felt good," not
 * "nice animation" -- if you consciously notice it, it's too much.
 */
export function AnimatedTabIcon({ name, color, size, focused }: AnimatedTabIconProps) {
  const scale = useRef(new Animated.Value(1)).current;
  const wasFocused = useRef(focused);

  useEffect(() => {
    if (focused && !wasFocused.current) {
      scale.setValue(0.95);
      Animated.sequence([
        Animated.spring(scale, { toValue: 1.05, useNativeDriver: true, speed: 40, bounciness: 6 }),
        Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 40, bounciness: 0 }),
      ]).start();
    }
    wasFocused.current = focused;
  }, [focused, scale]);

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Ionicons name={name} size={size} color={color} />
    </Animated.View>
  );
}
