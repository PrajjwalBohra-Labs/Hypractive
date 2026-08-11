import React, { useEffect, useRef } from 'react';
import { Animated, ViewStyle, DimensionValue } from 'react-native';
import { colors, radius } from '@/theme/tokens';

interface SkeletonProps {
  width?: DimensionValue;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

/** A single pulsing placeholder box. Compose these into shapes that
 * match the real content (see SkeletonListRow, SkeletonStatCard). */
export function Skeleton({ width = '100%', height = 16, borderRadius: cornerRadius = radius.sm, style }: SkeletonProps) {
  const opacity = useRef(new Animated.Value(0.55)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.55, duration: 600, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        { width, height, borderRadius: cornerRadius, backgroundColor: colors.textMuted, opacity },
        style,
      ]}
    />
  );
}
