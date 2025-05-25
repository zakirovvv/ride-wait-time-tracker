
import { create } from 'zustand';
import { AttractionSetting } from '@/types';
import { attractions } from '@/data/attractions';

interface AttractionSettingsState {
  settings: AttractionSetting[];
  updateDuration: (attractionId: string, duration: number) => void;
  getDuration: (attractionId: string) => number;
  resetToDefaults: () => void;
  loadFromStorage: () => void;
  saveToStorage: () => void;
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

  loadFromStorage: () => {
    try {
      const stored = localStorage.getItem('park-settings');
      if (stored) {
        const settings = JSON.parse(stored);
        set({ settings });
        console.log('Loaded settings from storage');
      }
    } catch (error) {
      console.error('Error loading settings from storage:', error);
    }
  },

  saveToStorage: () => {
    try {
      const { settings } = get();
      localStorage.setItem('park-settings', JSON.stringify(settings));
      
      // Уведомляем другие устройства об изменении
      const channel = new BroadcastChannel('park-sync');
      channel.postMessage({
        type: 'settings_update',
        data: settings,
        timestamp: Date.now()
      });
      channel.close();
      
      console.log('Saved settings to storage and broadcast update');
    } catch (error) {
      console.error('Error saving settings to storage:', error);
    }
  },

  updateDuration: (attractionId: string, duration: number) => {
    set(state => ({
      settings: state.settings.map(setting =>
        setting.attractionId === attractionId
          ? { ...setting, duration }
          : setting
      )
    }));
    
    // Сохраняем и синхронизируем
    get().saveToStorage();
  },

  getDuration: (attractionId: string) => {
    const setting = get().settings.find(s => s.attractionId === attractionId);
    return setting?.duration || attractions.find(a => a.id === attractionId)?.duration || 5;
  },

  resetToDefaults: () => {
    const defaultSettings = getDefaultSettings();
    set({ settings: defaultSettings });
    get().saveToStorage();
  }
}));

// Инициализация при загрузке приложения
if (typeof window !== 'undefined') {
  // Загружаем данные при старте
  useAttractionSettingsStore.getState().loadFromStorage();
  
  // Слушаем события синхронизации от других устройств
  window.addEventListener('settings-sync', (event: CustomEvent) => {
    console.log('Received settings sync event');
    useAttractionSettingsStore.getState().loadFromStorage();
  });
}
