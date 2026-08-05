import React from 'react';
import { StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface GlossSheenProps {
  style?: any;
}

/**
 * A quiet diagonal light sweep in the corner of a card — the "glossy"
 * signature touch, used the same way everywhere it appears (top-right
 * corner of headline stat cards) rather than as one-off decoration.
 */
export function GlossSheen({ style }: GlossSheenProps) {
  return (
    <LinearGradient
      colors={['rgba(20,20,20,0.05)', 'rgba(20,20,20,0)']}
      start={{ x: 1, y: 0 }}
      end={{ x: 0.3, y: 1 }}
      style={[StyleSheet.absoluteFillObject, style]}
      pointerEvents="none"
    />
  );
}
