import React, { useEffect, useState } from 'react';
import { Modal, View, Text, StyleSheet, Pressable, TextInput } from 'react-native';
import { colors, spacing, radius, type, fonts } from '@/theme/tokens';
import { Button } from '@/components/common/Button';
import { useTimerStore, getRemainingSeconds } from '@/state/timerStore';
import { scheduleRestTimerNotification, cancelRestTimerNotification } from '@/services/notificationService';
import type { RestTimerPreset } from '@/types/entities';

interface RestTimerModalProps {
  visible: boolean;
  onClose: () => void;
  presets: RestTimerPreset[];
}

export function RestTimerModal({ visible, onClose, presets }: RestTimerModalProps) {
  const { endsAt, isRunning, start, addSeconds, stop } = useTimerStore();
  const [customInput, setCustomInput] = useState('');
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      const r = getRemainingSeconds(endsAt);
      setRemaining(r);
      if (r === 0) {
        stop();
      }
    }, 250);
    return () => clearInterval(interval);
  }, [isRunning, endsAt, stop]);

  const handleStart = async (durationS: number) => {
    start(durationS);
    setRemaining(durationS);
    await scheduleRestTimerNotification(durationS);
  };

  const handleStop = async () => {
    await cancelRestTimerNotification();
    stop();
  };

  const handleAdd = (delta: number) => {
    addSeconds(delta);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <Text style={type.title}>Rest Timer</Text>

          {isRunning ? (
            <>
              <Text style={styles.countdown}>{remaining}s</Text>
              <View style={styles.adjustRow}>
                <Pressable style={styles.adjustButton} onPress={() => handleAdd(-15)}>
                  <Text style={styles.adjustText}>-15s</Text>
                </Pressable>
                <Pressable style={styles.adjustButton} onPress={() => handleAdd(15)}>
                  <Text style={styles.adjustText}>+15s</Text>
                </Pressable>
              </View>
              <Button label="Stop" variant="danger" onPress={handleStop} style={{ marginTop: spacing.lg }} />
            </>
          ) : (
            <>
              {presets.length === 0 ? (
                <Text style={[type.bodyMuted, { marginVertical: spacing.md }]}>
                  No presets yet — add one in Settings, or start a custom duration below.
                </Text>
              ) : (
                <View style={styles.presetRow}>
                  {presets.map((p) => (
                    <Pressable key={p.id} style={styles.presetButton} onPress={() => handleStart(p.durationS)}>
                      <Text style={styles.presetText}>{p.label}</Text>
                    </Pressable>
                  ))}
                </View>
              )}

              <View style={styles.customRow}>
                <TextInput
                  style={styles.customInput}
                  placeholder="Custom seconds"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="number-pad"
                  value={customInput}
                  onChangeText={setCustomInput}
                />
                <Button
                  label="Start"
                  onPress={() => {
                    const seconds = parseInt(customInput, 10);
                    if (!Number.isNaN(seconds) && seconds > 0) handleStart(seconds);
                  }}
                  style={{ flex: 1 }}
                />
              </View>
            </>
          )}

          <Pressable onPress={onClose} style={{ marginTop: spacing.lg, alignItems: 'center' }}>
            <Text style={type.bodyMuted}>Close</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: colors.surface, borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg, padding: spacing.xl },
  countdown: { ...type.display, fontSize: 48, textAlign: 'center', marginVertical: spacing.lg },
  adjustRow: { flexDirection: 'row', gap: spacing.md, justifyContent: 'center' },
  adjustButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
  },
  adjustText: { ...type.body, fontFamily: fonts.semibold },
  presetRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.md },
  presetButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: colors.border,
  },
  presetText: { ...type.body },
  customRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.lg, alignItems: 'center' },
  customInput: {
    flex: 1,
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    color: colors.textPrimary,
  },
});
