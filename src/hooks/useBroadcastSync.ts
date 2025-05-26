
import { useEffect, useRef, useState } from 'react';

export const useBroadcastSync = () => {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const [isConnected, setIsConnected] = useState(false);
  const [connectionAttempts, setConnectionAttempts] = useState(0);

  const connectWebSocket = () => {
    try {
      // Определяем протокол на основе текущего протокола страницы
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.hostname}:3001`;
      
      console.log('🔗 Попытка подключения к серверу синхронизации:', wsUrl);
      
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log('✅ Успешно подключились к серверу синхронизации');
        setIsConnected(true);
        setConnectionAttempts(0);
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
          console.error('❌ Ошибка при обработке сообщения от сервера:', error);
        }
      };

      wsRef.current.onclose = () => {
        console.log('⚠️ Соединение с сервером потеряно');
        setIsConnected(false);
        setConnectionAttempts(prev => prev + 1);
        
        // Если это не первая попытка, увеличиваем интервал переподключения
        const delay = Math.min(3000 * Math.pow(1.5, connectionAttempts), 30000);
        console.log(`🔄 Попытка переподключения через ${delay}ms...`);
        
        reconnectTimeoutRef.current = setTimeout(connectWebSocket, delay);
      };

      wsRef.current.onerror = (error) => {
        console.error('❌ Ошибка WebSocket:', error);
        setIsConnected(false);
      };

    } catch (error) {
      console.error('❌ Ошибка при создании WebSocket соединения:', error);
      setIsConnected(false);
      setConnectionAttempts(prev => prev + 1);
      
      // Fallback на localStorage синхронизацию при невозможности подключения
      const delay = Math.min(5000 * Math.pow(1.5, connectionAttempts), 60000);
      console.log(`🔄 Повторная попытка подключения через ${delay}ms...`);
      
      reconnectTimeoutRef.current = setTimeout(connectWebSocket, delay);
    }
  };

  useEffect(() => {
    connectWebSocket();

    // Fallback: слушаем события storage для локальной синхронизации
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'park-queue') {
        window.dispatchEvent(new CustomEvent('queue-sync', { detail: JSON.parse(e.newValue || '[]') }));
      }
      if (e.key === 'park-settings') {
        window.dispatchEvent(new CustomEvent('settings-sync', { detail: JSON.parse(e.newValue || '[]') }));
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const broadcastUpdate = (type: 'queue-update' | 'settings-update', data: any) => {
    // Сначала обновляем localStorage для мгновенного локального обновления
    const key = type === 'queue-update' ? 'park-queue' : 'park-settings';
    localStorage.setItem(key, JSON.stringify(data));
    
    // Затем пытаемся отправить на сервер
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type, data }));
      console.log(`📤 Отправлены обновления ${type} на сервер`);
    } else {
      console.log(`⚠️ Сервер недоступен, данные сохранены локально`);
      // Принудительно отправляем события синхронизации для локального обновления
      window.dispatchEvent(new CustomEvent(type === 'queue-update' ? 'queue-sync' : 'settings-sync', { detail: data }));
    }
  };

  return { 
    broadcastUpdate, 
    isConnected 
  };
};
