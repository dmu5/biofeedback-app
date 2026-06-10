import { create } from 'zustand';

interface BioState {
  isTracking: boolean;
  heartRate: number | null;
  toggleTracking: () => void;
  setHeartRate: (rate: number | null) => void;
}

export const useBioStore = create<BioState>((set) => ({
  isTracking: false,
  heartRate: null,

  toggleTracking: () => set((state) => ({ isTracking: !state.isTracking })),
  setHeartRate: (rate: number | null) => set({ heartRate: rate }),
}));
