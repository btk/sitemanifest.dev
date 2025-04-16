import { create } from 'zustand';

const useStore = create((set) => ({
  themeColor: '#ffffff',
  setThemeColor: (color) => set({ themeColor: color }),
}));

export { useStore }; 