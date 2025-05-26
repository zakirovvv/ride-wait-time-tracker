
import { create } from 'zustand';
import { AttractionSetting } from '@/types';
import { attractions } from '@/data/attractions';

interface AttractionSettingsState {
  settings: AttractionSetting[];
  updateDuration: (attractionId: string, duration: number) => void;
  getDuration: (attractionId: string) => number;
  resetToDefaults: () => void;
  setSettingsFromServer: (serverSettings: AttractionSetting[]) => void;
}

const getDefaultSettings = (): AttractionSetting[] => {
  return attractions.map(attraction => ({
    attractionId: attraction.id,
    duration: attraction.duration,
    capacity: attraction.capacity,
    isActive: attraction.isActive
  }));
};

export const useAttractionSettingsStore = create<AttractionSettingsState>((set, get) => ({
  settings: getDefaultSettings(),

  setSettingsFromServer: (serverSettings: AttractionSetting[]) => {
    console.log('📥 Установка настроек с сервера:', serverSettings.length, 'записей');
    if (serverSettings && Array.isArray(serverSettings) && serverSettings.length > 0) {
      set({ settings: serverSettings });
    }
  },

  updateDuration: (attractionId: string, duration: number) => {
    const newSettings = get().settings.map(setting =>
      setting.attractionId === attractionId
        ? { ...setting, duration }
        : setting
    );
    
    set({ settings: newSettings });
    
    // Отправляем на сервер
    if (window.broadcastSettingsUpdate) {
      window.broadcastSettingsUpdate(newSettings);
    }
    
    console.log('⚙️ Обновлена длительность и отправлено на сервер:', attractionId, duration);
  },

  getDuration: (attractionId: string) => {
    const setting = get().settings.find(s => s.attractionId === attractionId);
    return setting?.duration || attractions.find(a => a.id === attractionId)?.duration || 5;
  },

  resetToDefaults: () => {
    const defaultSettings = getDefaultSettings();
    set({ settings: defaultSettings });
    
    // Отправляем на сервер
    if (window.broadcastSettingsUpdate) {
      window.broadcastSettingsUpdate(defaultSettings);
    }
  }
}));
