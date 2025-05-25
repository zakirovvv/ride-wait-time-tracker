
import { useEffect } from 'react';
import { useWebRTCSync } from './useWebRTCSync';

type SyncMessage = {
  type: 'queue_update' | 'settings_update';
  data: any;
  timestamp: number;
};

export const useBroadcastSync = () => {
  const { broadcastMessage, isConnected } = useWebRTCSync();

  useEffect(() => {
    // Обработчик для отправки обновлений очереди
    const handleQueueBroadcast = (event: CustomEvent) => {
      if (isConnected) {
        broadcastMessage({
          type: 'queue_update',
          data: event.detail.queue
        });
      }
    };

    // Обработчик для отправки обновлений настроек
    const handleSettingsBroadcast = (event: CustomEvent) => {
      if (isConnected) {
        broadcastMessage({
          type: 'settings_update',
          data: event.detail.settings
        });
      }
    };

    // Слушаем события от stores для отправки через WebRTC
    window.addEventListener('broadcast-queue-update', handleQueueBroadcast as EventListener);
    window.addEventListener('broadcast-settings-update', handleSettingsBroadcast as EventListener);

    return () => {
      window.removeEventListener('broadcast-queue-update', handleQueueBroadcast as EventListener);
      window.removeEventListener('broadcast-settings-update', handleSettingsBroadcast as EventListener);
    };
  }, [broadcastMessage, isConnected]);

  // Функция для отправки обновлений другим устройствам (legacy совместимость)
  const broadcastUpdate = (type: SyncMessage['type'], data: any) => {
    console.log('Broadcasting update via WebRTC:', type, data);
    
    if (isConnected) {
      broadcastMessage({
        type,
        data
      });
    }

    // Fallback через localStorage для совместимости
    const message: SyncMessage = {
      type,
      data,
      timestamp: Date.now()
    };
    
    try {
      localStorage.setItem('last-sync-message', JSON.stringify(message));
    } catch (error) {
      console.error('Error with localStorage fallback:', error);
    }
  };

  return { broadcastUpdate, isConnected };
};
