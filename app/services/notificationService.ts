/**
 * Background "rest complete" alerts via expo-notifications.
 *
 * Disabled while running in Expo Go: as of SDK 53, Expo Go on Android no
 * longer supports expo-notifications at all (even local/scheduled
 * notifications trigger a hard error the moment the module initializes,
 * not just push/remote ones) -- this is a permanent Expo Go platform
 * limitation, not something fixable by picking a different package
 * version. It requires a real development build to work.
 *
 * The Rest Timer itself is unaffected: it derives remaining time from a
 * stored end timestamp (architecture 6.9), so the countdown stays
 * correct even if the app is backgrounded -- the only thing lost here is
 * the audible/vibration ping while the app isn't in the foreground.
 *
 * This will be re-enabled once the project moves to a development build
 * / the final .apk, at which point these functions do real work again.
 */

export async function requestNotificationPermission(): Promise<void> {
  // No-op in Expo Go -- see file header.
}

export async function scheduleRestTimerNotification(_secondsFromNow: number): Promise<void> {
  // No-op in Expo Go -- see file header.
}

export async function cancelRestTimerNotification(): Promise<void> {
  // No-op in Expo Go -- see file header.
}
