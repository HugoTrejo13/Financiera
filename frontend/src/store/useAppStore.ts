import { create } from 'zustand';

interface AppState {
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
}

// Initial theme detection
const getInitialTheme = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('theme') === 'dark' || 
           (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
  }
  return false;
};

export const useAppStore = create<AppState>((set) => ({
  isDarkMode: getInitialTheme(),
  setIsDarkMode: (val) => set({ isDarkMode: val })
}));
