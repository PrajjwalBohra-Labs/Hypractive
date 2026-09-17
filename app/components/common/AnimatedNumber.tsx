import React, { useEffect, useRef, useState } from 'react';
import { Animated, Text, TextStyle } from 'react-native';

interface AnimatedNumberProps {
  value: number;
  duration?: number;
  formatValue?: (v: number) => string;
  style?: TextStyle;
}

/**
 * Counts up from its previously-displayed value to `value` over
 * `duration` ms. Per the design spec: numbers should animate only on
 * meaningful change, not every time a screen opens. This is naturally
 * true here -- it animates FROM its last rendered value, so the very
 * first render (nothing to compare against yet) shows the number
 * directly with no animation, and later renders only animate if the
 * value actually changed.
 */
export function AnimatedNumber({ value, duration = 600, formatValue, style }: AnimatedNumberProps) {
  const animated = useRef(new Animated.Value(value)).current;
  const [displayValue, setDisplayValue] = useState(value);
  const previousValue = useRef(value);

  useEffect(() => {
    if (previousValue.current === value) return;

    animated.setValue(previousValue.current);
    const listenerId = animated.addListener(({ value: v }) => setDisplayValue(v));

    Animated.timing(animated, {
      toValue: value,
      duration,
      useNativeDriver: false,
    }).start(() => {
      animated.removeListener(listenerId);
    });

    previousValue.current = value;
    return () => {
      animated.removeListener(listenerId);
    };
  }, [value, duration, animated]);

  const text = formatValue ? formatValue(displayValue) : String(Math.round(displayValue));

  return <Text style={style}>{text}</Text>;
}