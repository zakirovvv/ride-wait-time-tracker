
import { useEffect, useRef } from 'react';

export const useBroadcastSync = () => {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();

  const connectWebSocket = () => {
    try {
      // Определяем адрес WebSocket сервера
      const wsUrl = `ws://${window.location.hostname}:3001`;
      console.log('Подключаемся к серверу синхронизации:', wsUrl);
      
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log('✅ Подключились к серверу синхронизации');
      };

      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'init') {
            // Инициализация данных с сервера
            if (data.queue && data.queue.length > 0) {
              localStorage.setItem('park-queue', JSON.stringify(data.queue));
              window.dispatchEvent(new CustomEvent('queue-sync', { detail: data.queue }));
            }
            if (data.settings && data.settings.length > 0) {
              localStorage.setItem('park-settings', JSON.stringify(data.settings));
              window.dispatchEvent(new CustomEvent('settings-sync', { detail: data.settings }));
            }
          }
          
          if (data.type === 'queue-sync') {
            localStorage.setItem('park-queue', JSON.stringify(data.data));
            window.dispatchEvent(new CustomEvent('queue-sync', { detail: data.data }));
            console.log('📥 Получены обновления очереди с сервера');
          }
          
          if (data.type === 'settings-sync') {
            localStorage.setItem('park-settings', JSON.stringify(data.data));
            window.dispatchEvent(new CustomEvent('settings-sync', { detail: data.data }));
            console.log('📥 Получены обновления настроек с сервера');
          }
        } catch (error) {
          console.error('Ошибка при обработке сообщения от сервера:', error);
        }
      };

      wsRef.current.onclose = () => {
        console.log('❌ Соединение с сервером потеряно. Попытка переподключения через 3 секунды...');
        reconnectTimeoutRef.current = setTimeout(connectWebSocket, 3000);
      };

      wsRef.current.onerror = (error) => {
        console.error('Ошибка WebSocket:', error);
      };

    } catch (error) {
      console.error('Ошибка при подключении к серверу:', error);
      reconnectTimeoutRef.current = setTimeout(connectWebSocket, 3000);
    }
  };

  useEffect(() => {
    connectWebSocket();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  const broadcastUpdate = (type: 'queue-update' | 'settings-update', data: any) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type, data }));
      console.log(`📤 Отправлены обновления ${type} на сервер`);
    } else {
      console.log('⚠️ Сервер недоступен, данные сохранены локально');
    }
  };

  return { 
    broadcastUpdate, 
    isConnected: wsRef.current?.readyState === WebSocket.OPEN 
  };
};
