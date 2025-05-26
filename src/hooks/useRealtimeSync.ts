
import { useEffect } from 'react';
import { useQueueStore } from '@/stores/queueStore';
import { useAttractionSettingsStore } from '@/stores/attractionSettingsStore';

export const useRealtimeSync = () => {
  const queueStore = useQueueStore();
  const settingsStore = useAttractionSettingsStore();

  useEffect(() => {
    const handleServerQueueSync = (event: CustomEvent) => {
      console.log('🔄 Получена синхронизация очереди с сервера');
      const queueData = event.detail;
      if (queueData && Array.isArray(queueData)) {
        queueStore.setQueueFromServer(queueData);
      }
    };

    const handleServerSettingsSync = (event: CustomEvent) => {
      console.log('🔄 Получена синхронизация настроек с сервера');
      const settingsData = event.detail;
      if (settingsData && Array.isArray(settingsData)) {
        settingsStore.setSettingsFromServer(settingsData);
        // После обновления настроек пересчитываем очереди
        queueStore.updateQueueSummary();
      }
    };

    // Подписываемся на события от сервера
    window.addEventListener('server-queue-sync', handleServerQueueSync as EventListener);
    window.addEventListener('server-settings-sync', handleServerSettingsSync as EventListener);

    return () => {
      window.removeEventListener('server-queue-sync', handleServerQueueSync as EventListener);
      window.removeEventListener('server-settings-sync', handleServerSettingsSync as EventListener);
    };
  }, [queueStore, settingsStore]);

  return {
    forceSync: () => {
      console.log('🔄 Принудительная синхронизация');
      // Запрашиваем данные с сервера
      window.dispatchEvent(new CustomEvent('request-server-sync'));
    }
  };
};
