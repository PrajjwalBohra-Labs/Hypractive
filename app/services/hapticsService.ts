import * as Haptics from 'expo-haptics';

/**
 * Thin, semantic wrapper around expo-haptics. Named for *when* to use
 * each one (per the design spec's haptic moments), not what they do
 * technically. Every call is fire-and-forget and swallows errors --
 * haptics are a nice-to-have, never something that should crash a
 * screen if a device/emulator doesn't support them.
 */

export function hapticLight(): void {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
}

export function hapticSuccess(): void {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
}
