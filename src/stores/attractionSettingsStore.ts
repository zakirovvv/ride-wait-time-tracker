
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AttractionSettings {
  id: string;
  duration: number;
}

interface AttractionSettingsState {
  settings: Record<string, number>; // attractionId -> duration
  updateDuration: (attractionId: string, duration: number) => void;
  getDuration: (attractionId: string) => number;
}

export const useAttractionSettingsStore = create<AttractionSettingsState>()(
  persist(
    (set, get) => ({
      settings: {},
      
      updateDuration: (attractionId: string, duration: number) => {
        set((state) => ({
          settings: {
            ...state.settings,
            [attractionId]: duration
          }
        }));
      },
      
      getDuration: (attractionId: string) => {
        const settings = get().settings;
        return settings[attractionId] || getDefaultDuration(attractionId);
      }
    }),
    {
      name: 'attraction-settings'
    }
  )
);

// Функция для получения стандартного времени аттракциона
const getDefaultDuration = (attractionId: string): number => {
  const defaultDurations: Record<string, number> = {
    '1': 10, // Прыжки с веревкой
    '2': 8,  // Парные качели
    '3': 15, // Веревочный парк
    '4': 6,  // Качели
    '5': 12, // Скалодром
    '6': 5,  // Мини-троллей
    '7': 8,  // Троллей
    '8': 20, // Спуск в грот
    '9': 10, // Большой мост
    '10': 5, // Малый мост
    '11': 15 // Вертолет
  };
  return defaultDurations[attractionId] || 10;
};
