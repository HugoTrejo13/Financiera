import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  path?: string;
  read: boolean;
  date: string;
}

interface AppState {
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
  notifications: AppNotification[];
  addNotification: (notif: Omit<AppNotification, 'id' | 'read' | 'date'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
}

const getInitialTheme = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('theme') === 'dark' || 
           (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
  }
  return false;
};

export const useAppStore = create<AppState>((set) => ({
  isDarkMode: getInitialTheme(),
  setIsDarkMode: (val) => set({ isDarkMode: val }),
  notifications: [],
  addNotification: (notif) => set((state) => ({
    notifications: [
      {
        ...notif,
        id: uuidv4(),
        read: false,
        date: new Date().toISOString()
      },
      ...state.notifications
    ]
  })),
  markAsRead: (id) => set((state) => ({
    notifications: state.notifications.map(n => n.id === id ? { ...n, read: true } : n)
  })),
  markAllAsRead: () => set((state) => ({
    notifications: state.notifications.map(n => ({ ...n, read: true }))
  })),
  clearNotifications: () => set({ notifications: [] })
}));
