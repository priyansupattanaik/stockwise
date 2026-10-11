import { create } from 'zustand';

interface SettingsState {
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;
  toggleTheme: () => void;
  showDelayedBadge: boolean;
  setShowDelayedBadge: (show: boolean) => void;
  sessionTokensUsed: number;
  sessionCostUsd: number;
  recordTokens: (tokens: number, cost: number) => void;
  resetTokenBudget: () => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  theme: 'dark',
  setTheme: (theme) => set({ theme }),
  toggleTheme: () => set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),
  showDelayedBadge: true,
  setShowDelayedBadge: (showDelayedBadge) => set({ showDelayedBadge }),
  sessionTokensUsed: 6245,
  sessionCostUsd: 0.0482,
  recordTokens: (tokens, cost) =>
    set((state) => ({
      sessionTokensUsed: state.sessionTokensUsed + tokens,
      sessionCostUsd: Number((state.sessionCostUsd + cost).toFixed(6)),
    })),
  resetTokenBudget: () => set({ sessionTokensUsed: 0, sessionCostUsd: 0 }),
}));
