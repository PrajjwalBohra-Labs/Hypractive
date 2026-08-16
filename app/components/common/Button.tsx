import React, { useRef } from 'react';
import { Pressable, Text, View, StyleSheet, ActivityIndicator, ViewStyle, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, type, fonts } from '@/theme/tokens';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  icon?: keyof typeof Ionicons.glyphMap;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
}

export function Button({ label, onPress, variant = 'primary', icon, disabled, loading, style }: ButtonProps) {
  const isPrimary = variant === 'primary';
  const isSecondary = variant === 'secondary';
  const isDanger = variant === 'danger';
  const labelColor = isPrimary ? colors.background : colors.textPrimary;
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, speed: 50, bounciness: 0 }).start();
  };
  const handlePressOut = () => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 40, bounciness: 6 }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        style={({ pressed }) => [
          styles.base,
          isPrimary && styles.primaryShadow,
          isSecondary && { backgroundColor: colors.surfaceRaised, borderWidth: 1, borderColor: colors.border },
          isDanger && { backgroundColor: 'transparent', borderWidth: 2, borderColor: colors.textPrimary },
          (disabled || loading) && { opacity: 0.5 },
          pressed && { opacity: 0.85 },
          style,
        ]}
      >
        {isPrimary && (
          <LinearGradient
            colors={[colors.accentPressed, colors.accent]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFillObject}
          />
        )}
        {loading ? (
          <ActivityIndicator color={labelColor} />
        ) : (
          <View style={styles.content}>
            {icon && <Ionicons name={icon} size={18} color={labelColor} style={styles.icon} />}
            {isDanger && <Ionicons name="close" size={18} color={labelColor} style={styles.icon} />}
            <Text style={[styles.label, { color: labelColor }]}>{label}</Text>
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: spacing.xs,
  },
  primaryShadow: {
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  label: {
    ...type.subtitle,
    fontFamily: fonts.bold,
  },
});
