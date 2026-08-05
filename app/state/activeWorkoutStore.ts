import { create } from 'zustand';
import * as workoutSessionRepository from '@/db/repositories/workoutSessionRepository';
import * as templateRepository from '@/db/repositories/templateRepository';
import * as exerciseRepository from '@/db/repositories/exerciseRepository';
import { getOverloadForNewSet, OverloadResult } from '@/services/overloadService';
import { finishWorkoutAndRecordHistory, PrHitSummary } from '@/services/workoutLogService';
import type { LoggedSet } from '@/types/entities';

interface ActiveWorkoutState {
  sessionId: string | null;
  exerciseIds: string[];
  exerciseNames: Record<string, string>;
  setsByExercise: Record<string, LoggedSet[]>;
  lastOverloadByExercise: Record<string, OverloadResult | null>;
  startFromTemplate: (userId: string, templateId: string) => Promise<void>;
  startBlank: (userId: string) => Promise<void>;
  addExercise: (exerciseId: string, name: string) => void;
  addSet: (exerciseId: string, weightKg: number | null, reps: number, rpe: number | null) => Promise<void>;
  finish: (userId: string) => Promise<PrHitSummary[]>;
  reset: () => void;
}

export const useActiveWorkoutStore = create<ActiveWorkoutState>((set, get) => ({
  sessionId: null,
  exerciseIds: [],
  exerciseNames: {},
  setsByExercise: {},
  lastOverloadByExercise: {},

  startFromTemplate: async (userId, templateId) => {
    const session = await workoutSessionRepository.createSession(userId, templateId);
    const templateEntries = await templateRepository.listTemplateExercises(templateId);
    const exerciseIds: string[] = [];
    const exerciseNames: Record<string, string> = {};
    for (const entry of templateEntries) {
      const ex = await exerciseRepository.getExercise(entry.exerciseId);
      if (ex) {
        exerciseIds.push(ex.id);
        exerciseNames[ex.id] = ex.name;
      }
    }
    set({ sessionId: session.id, exerciseIds, exerciseNames, setsByExercise: {}, lastOverloadByExercise: {} });
  },

  startBlank: async (userId) => {
    const session = await workoutSessionRepository.createSession(userId, null);
    set({ sessionId: session.id, exerciseIds: [], exerciseNames: {}, setsByExercise: {}, lastOverloadByExercise: {} });
  },

  addExercise: (exerciseId, name) => {
    const { exerciseIds, exerciseNames } = get();
    if (exerciseIds.includes(exerciseId)) return;
    set({
      exerciseIds: [...exerciseIds, exerciseId],
      exerciseNames: { ...exerciseNames, [exerciseId]: name },
    });
  },

  addSet: async (exerciseId, weightKg, reps, rpe) => {
    const { sessionId, setsByExercise, lastOverloadByExercise } = get();
    if (!sessionId) return;
    const overload = await getOverloadForNewSet(exerciseId, weightKg, reps);
    const newSet = await workoutSessionRepository.addLoggedSet(sessionId, exerciseId, weightKg, reps, rpe);
    set({
      setsByExercise: {
        ...setsByExercise,
        [exerciseId]: [...(setsByExercise[exerciseId] ?? []), newSet],
      },
      lastOverloadByExercise: { ...lastOverloadByExercise, [exerciseId]: overload },
    });
  },

  finish: async (userId) => {
    const { sessionId } = get();
    if (!sessionId) return [];
    const prs = await finishWorkoutAndRecordHistory(sessionId, userId);
    return prs;
  },

  reset: () => {
    set({ sessionId: null, exerciseIds: [], exerciseNames: {}, setsByExercise: {}, lastOverloadByExercise: {} });
  },
}));
