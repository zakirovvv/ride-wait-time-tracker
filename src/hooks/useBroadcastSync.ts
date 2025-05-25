
import { useEffect } from 'react';

type SyncMessage = {
  type: 'queue_update' | 'settings_update';
  data: any;
  timestamp: number;
};

export const useBroadcastSync = () => {
  useEffect(() => {
    // Создаем канал для синхронизации
    const channel = new BroadcastChannel('park-sync');

    // Слушаем сообщения от других устройств/вкладок
    channel.onmessage = (event: MessageEvent<SyncMessage>) => {
      const { type, data, timestamp } = event.data;
      
      console.log('Received sync message:', type, data);
      
      // Проверяем, не слишком ли старое сообщение (избегаем бесконечных циклов)
      const now = Date.now();
      if (now - timestamp > 1000) return; // Игнорируем сообщения старше 1 секунды
      
      switch (type) {
        case 'queue_update':
          // Обновляем данные очереди из localStorage
          const queueData = localStorage.getItem('park-queue');
          if (queueData) {
            try {
              const parsedData = JSON.parse(queueData);
              // Принудительно обновляем store
              window.dispatchEvent(new CustomEvent('queue-sync', { detail: parsedData }));
            } catch (error) {
              console.error('Error parsing queue data:', error);
            }
          }
          break;
          
        case 'settings_update':
          // Обновляем настройки из localStorage
          const settingsData = localStorage.getItem('park-settings');
          if (settingsData) {
            try {
              const parsedData = JSON.parse(settingsData);
              window.dispatchEvent(new CustomEvent('settings-sync', { detail: parsedData }));
            } catch (error) {
              console.error('Error parsing settings data:', error);
            }
          }
          break;
      }
    };

    return () => {
      channel.close();
    };
  }, []);

  // Функция для отправки обновлений другим устройствам
  const broadcastUpdate = (type: SyncMessage['type'], data: any) => {
    const channel = new BroadcastChannel('park-sync');
    const message: SyncMessage = {
      type,
      data,
      timestamp: Date.now()
    };
    
    console.log('Broadcasting update:', type, data);
    channel.postMessage(message);
    channel.close();
  };

  return { broadcastUpdate };
};
