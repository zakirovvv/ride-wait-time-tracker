
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
      // Принудительно обновляем сводку очереди
      queueStore.updateQueueSummary();
    };

    const handleSettingsSync = (event: CustomEvent) => {
      console.log('🔄 Получено обновление настроек в реальном времени');
      settingsStore.loadFromStorage();
      // После обновления настроек нужно пересчитать очереди
      queueStore.updateQueueSummary();
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
      }
      if (e.key === 'park-settings') {
        console.log('📦 Изменения в localStorage для настроек');
        settingsStore.loadFromStorage();
        queueStore.updateQueueSummary();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('queue-sync', handleQueueSync as EventListener);
      window.removeEventListener('settings-sync', handleSettingsSync as EventListener);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [queueStore, settingsStore]);

  return {
    forceSync: () => {
      queueStore.loadFromStorage();
      settingsStore.loadFromStorage();
      queueStore.updateQueueSummary();
    }
  };
};
