import { create } from 'zustand';
import type { User, UnitPreference } from '@/types/entities';
import * as userRepository from '@/db/repositories/userRepository';
import { hashPassword, verifyPassword } from '@/services/authService';
import { validateSignUp, validateLogIn } from '@/utils/validation';

interface UserState {
  user: User | null;
  loading: boolean;
  loadUser: () => Promise<void>;
  signUp: (email: string, password: string, confirmPassword: string, displayName: string, unitPreference: UnitPreference) => Promise<{ success: boolean; errors: Record<string, string> }>;
  logIn: (email: string, password: string) => Promise<{ success: boolean; errors: Record<string, string> }>;
  logOut: () => Promise<void>;
  setUnitPreference: (unitPreference: UnitPreference) => Promise<void>;
}

export const useUserStore = create<UserState>((set, get) => ({
  user: null,
  loading: true,

  loadUser: async () => {
    set({ loading: true });
    const user = await userRepository.getCurrentUser();
    set({ user, loading: false });
  },

  signUp: async (email, password, confirmPassword, displayName, unitPreference) => {
    const validation = validateSignUp({ email, password, confirmPassword, displayName });
    if (!validation.valid) return { success: false, errors: validation.errors };

    const existing = await userRepository.findUserByEmail(email);
    if (existing) return { success: false, errors: { email: 'An account with this email already exists on this device.' } };

    const passwordHash = await hashPassword(password);
    const user = await userRepository.createAccount({ email, passwordHash, displayName, unitPreference });
    set({ user });
    return { success: true, errors: {} };
  },

  logIn: async (email, password) => {
    const validation = validateLogIn({ email, password });
    if (!validation.valid) return { success: false, errors: validation.errors };

    const existing = await userRepository.findUserByEmail(email);
    if (!existing || !existing.passwordHash || !(await verifyPassword(password, existing.passwordHash))) {
      return { success: false, errors: { password: 'Email or password is incorrect.' } };
    }

    await userRepository.setLoggedIn(existing.id, true);
    set({ user: { ...existing, isLoggedIn: true } });
    return { success: true, errors: {} };
  },

  logOut: async () => {
    const current = get().user;
    if (!current) return;
    await userRepository.setLoggedIn(current.id, false);
    set({ user: null });
  },

  setUnitPreference: async (unitPreference) => {
    const current = get().user;
    if (!current) return;
    await userRepository.updateUnitPreference(current.id, unitPreference);
    set({ user: { ...current, unitPreference } });
  },
}));
