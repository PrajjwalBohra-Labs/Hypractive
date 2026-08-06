import React, { useState } from 'react';
import { Text, StyleSheet } from 'react-native';
import { Card } from '@/components/common/Card';
import { spacing, type } from '@/theme/tokens';
import { ROAST_LINES, pickRandom } from '@/content/roastCopy';

/**
 * A quiet dark-humor aside between sections. Picks one line per mount
 * (not per render) so it doesn't change every time the screen re-renders
 * from an unrelated state update.
 */
export function RoastCard() {
  const [line] = useState(() => pickRandom(ROAST_LINES));

  return (
    <Card style={styles.card}>
      <Text style={type.body}>{line}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { marginVertical: spacing.lg },
});
