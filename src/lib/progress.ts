import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type State = {
  passed: Record<string, true>;
  best: Record<string, number>;
  attempts: Record<string, number>;
  record: (id: string, correct: number, total: number) => void;
  reset: () => void;
};

const empty = { passed: {}, best: {}, attempts: {} };

export const useProgress = create<State>()(
  persist(
    (set, get) => ({
      ...empty,
      record: (id, correct, total) => {
        const prev = get();
        const pass = correct / total >= 0.75;
        set({
          best: { ...prev.best, [id]: Math.max(prev.best[id] ?? 0, correct) },
          attempts: { ...prev.attempts, [id]: (prev.attempts[id] ?? 0) + 1 },
          passed: pass ? { ...prev.passed, [id]: true } : prev.passed,
        });
      },
      reset: () => set({ ...empty }),
    }),
    {
      name: "nueve-progress",
      version: 1,
      skipHydration: true,
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
