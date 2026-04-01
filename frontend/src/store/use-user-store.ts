import { create } from "zustand";

interface UserState {
  name: string;
  avatar: string;
  streak: number;
  exp: number;
  level: number;
  wordsLearned: number;
}

interface UserStore extends UserState {
  incrementStreak: () => void;
  addExp: (amount: number) => void;
  setUser: (user: Partial<UserState>) => void;
}

export const useUserStore = create<UserStore>((set) => ({
  name: "Learner",
  avatar: "",
  streak: 0,
  exp: 0,
  level: 1,
  wordsLearned: 0,
  incrementStreak: () => set((state) => ({ streak: state.streak + 1 })),
  addExp: (amount: number) =>
    set((state) => {
      const newExp = state.exp + amount;
      const newLevel = Math.floor(newExp / 100) + 1;
      return { exp: newExp, level: newLevel };
    }),
  setUser: (user) => set((state) => ({ ...state, ...user })),
}));
