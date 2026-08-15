import React from 'react';
import { StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '@/theme/tokens';

interface GlossSheenProps {
  style?: any;
}

/**
 * A quiet diagonal light sweep in the corner of a card — uses the
 * shared `sheen` token so it stays correct if the palette ever changes
 * again, instead of a color baked directly into this component.
 */
export function GlossSheen({ style }: GlossSheenProps) {
  return (
    <LinearGradient
      colors={[colors.sheen, 'rgba(0,0,0,0)']}
      start={{ x: 1, y: 0 }}
      end={{ x: 0.3, y: 1 }}
      style={[StyleSheet.absoluteFillObject, style]}
      pointerEvents="none"
    />
  );
}
