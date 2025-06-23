
import { useState, useEffect } from 'react';
import { attractions } from '@/data/attractions';

export interface LocalAttractionSetting {
  attraction_id: string;
  duration: number;
  capacity: number;
  is_active: boolean;
}

const SETTINGS_STORAGE_KEY = 'local_attraction_settings';

export const useLocalSettings = () => {
  const [settings, setSettings] = useState<LocalAttractionSetting[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSettings();

    // Подписка на WebSocket обновления
    const ws = new WebSocket(`ws://${window.location.hostname}:3001`);
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'settings-sync') {
        setSettings(data.data || []);
      }
    };

    ws.onopen = () => {
      console.log('🔗 Подключено к серверу настроек');
    };

    ws.onerror = (error) => {
      console.warn('⚠️ Ошибка подключения к серверу настроек:', error);
    };

    return () => {
      ws.close();
    };
  }, []);

  const loadSettings = () => {
    try {
      const savedSettings = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      } else {
        // Создаем настройки по умолчанию
        const defaultSettings = attractions.map(attraction => ({
          attraction_id: attraction.id,
          duration: attraction.duration,
          capacity: attraction.capacity,
          is_active: attraction.isActive
        }));
        setSettings(defaultSettings);
        localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(defaultSettings));
      }
    } catch (error) {
      console.error('Ошибка загрузки настроек:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = (newSettings: LocalAttractionSetting[]) => {
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(newSettings));
      
      // Отправляем обновление на WebSocket сервер
      const ws = new WebSocket(`ws://${window.location.hostname}:3001`);
      ws.onopen = () => {
        ws.send(JSON.stringify({
          type: 'settings-update',
          data: newSettings
        }));
        ws.close();
      };
    } catch (error) {
      console.error('Ошибка сохранения настроек:', error);
    }
  };

  const updateDuration = (attractionId: string, duration: number) => {
    const newSettings = settings.map(setting =>
      setting.attraction_id === attractionId
        ? { ...setting, duration }
        : setting
    );
    
    setSettings(newSettings);
    saveSettings(newSettings);
    
    console.log('⚙️ Обновлена длительность:', attractionId, duration);
  };

  const getDuration = (attractionId: string) => {
    const setting = settings.find(s => s.attraction_id === attractionId);
    return setting?.duration || attractions.find(a => a.id === attractionId)?.duration || 5;
  };

  return {
    settings,
    isLoading,
    updateDuration,
    getDuration,
    refreshSettings: loadSettings
  };
};
