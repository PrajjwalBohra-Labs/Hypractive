import React, { useRef } from 'react';
import { Animated, Pressable, PressableProps, ViewStyle } from 'react-native';
import { useReducedMotion } from '@/utils/useReducedMotion';

interface AnimatedPressableProps extends Omit<PressableProps, 'style'> {
  children: React.ReactNode;
  style?: ViewStyle;
  scaleTo?: number;
}

/** Subtle press-down feedback for list rows and simple cards -- the same
 * spring timing as Button, so touch feedback feels consistent everywhere
 * in the app rather than varying screen to screen. Skips the scale
 * animation entirely when the system's reduce-motion setting is on. */
export function AnimatedPressable({ children, style, scaleTo = 0.97, onPressIn, onPressOut, ...props }: AnimatedPressableProps) {
  const scale = useRef(new Animated.Value(1)).current;
  const reducedMotion = useReducedMotion();

  const handlePressIn = (e: any) => {
    if (!reducedMotion) {
      Animated.spring(scale, { toValue: scaleTo, useNativeDriver: true, speed: 50, bounciness: 0 }).start();
    }
    onPressIn?.(e);
  };
  const handlePressOut = (e: any) => {
    if (!reducedMotion) {
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 40, bounciness: 6 }).start();
    }
    onPressOut?.(e);
  };

  return (
    <Animated.View style={[{ transform: [{ scale }] }, style]}>
      <Pressable {...props} onPressIn={handlePressIn} onPressOut={handlePressOut}>
        {children}
      </Pressable>
    </Animated.View>
  );
}
