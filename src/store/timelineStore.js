// store/timelineStore.js
import { create } from "zustand";

export const useTimelineStore = create((set, get) => ({
  isInitialized: false,
  prevPosition: { x: 50, y: 250 },
  currentPointIndex: 0,
  currentDayIndex: 0,

  initializeTimeline: () => set({ isInitialized: true }),
  resetTimeline: () =>
    set({
      isInitialized: false,
      prevPosition: { x: 50, y: 250 },
      currentPointIndex: 0,
      currentDayIndex: 0,
    }),
}));
