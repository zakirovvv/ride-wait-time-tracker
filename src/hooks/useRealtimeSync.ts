
import { useEffect } from 'react';
import { useQueueStore } from '@/stores/queueStore';
import { useAttractionSettingsStore } from '@/stores/attractionSettingsStore';

export const useRealtimeSync = () => {
  const queueStore = useQueueStore();
  const settingsStore = useAttractionSettingsStore();

  useEffect(() => {
    const handleQueueSync = (event: CustomEvent) => {
      console.log('🔄 Получено обновление очереди в реальном времени');
      queueStore.loadFromStorage();
      queueStore.updateQueueSummary();
      // Принудительно обновляем компоненты
      queueStore.forceUpdate();
    };

    const handleSettingsSync = (event: CustomEvent) => {
      console.log('🔄 Получено обновление настроек в реальном времени');
      settingsStore.loadFromStorage();
      queueStore.updateQueueSummary();
      queueStore.forceUpdate();
    };

    // Подписываемся на события синхронизации
    window.addEventListener('queue-sync', handleQueueSync as EventListener);
    window.addEventListener('settings-sync', handleSettingsSync as EventListener);

    // Также слушаем события хранилища для мгновенного обновления
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'park-queue') {
        console.log('📦 Изменения в localStorage для очереди');
        queueStore.loadFromStorage();
        queueStore.updateQueueSummary();
        queueStore.forceUpdate();
      }
      if (e.key === 'park-settings') {
        console.log('📦 Изменения в localStorage для настроек');
        settingsStore.loadFromStorage();
        queueStore.updateQueueSummary();
        queueStore.forceUpdate();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Дополнительная проверка каждые 1000ms для гарантии синхронизации
    const syncInterval = setInterval(() => {
      queueStore.loadFromStorage();
      queueStore.updateQueueSummary();
    }, 1000);

    return () => {
      window.removeEventListener('queue-sync', handleQueueSync as EventListener);
      window.removeEventListener('settings-sync', handleSettingsSync as EventListener);
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(syncInterval);
    };
  }, [queueStore, settingsStore]);

  return {
    forceSync: () => {
      queueStore.loadFromStorage();
      settingsStore.loadFromStorage();
      queueStore.updateQueueSummary();
      queueStore.forceUpdate();
    }
  };
};
