import { create } from 'zustand';

interface TimerState {
  endsAt: number | null; // epoch ms
  totalDurationS: number | null;
  isRunning: boolean;
  start: (durationS: number) => void;
  addSeconds: (deltaS: number) => void;
  stop: () => void;
}

export const useTimerStore = create<TimerState>((set, get) => ({
  endsAt: null,
  totalDurationS: null,
  isRunning: false,
  start: (durationS: number) => {
    set({ endsAt: Date.now() + durationS * 1000, totalDurationS: durationS, isRunning: true });
  },
  addSeconds: (deltaS: number) => {
    const { endsAt } = get();
    if (endsAt === null) return;
    set({ endsAt: endsAt + deltaS * 1000 });
  },
  stop: () => {
    set({ endsAt: null, totalDurationS: null, isRunning: false });
  },
}));

/** Derives remaining whole seconds from endsAt. Returns 0 if not running or elapsed. */
export function getRemainingSeconds(endsAt: number | null): number {
  if (endsAt === null) return 0;
  return Math.max(0, Math.round((endsAt - Date.now()) / 1000));
}
