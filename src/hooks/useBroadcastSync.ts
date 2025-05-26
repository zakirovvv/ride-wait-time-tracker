
import { useEffect, useRef, useState, useCallback } from 'react';

export const useBroadcastSync = () => {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const [isConnected, setIsConnected] = useState(false);
  const [connectionAttempts, setConnectionAttempts] = useState(0);

  const connectWebSocket = useCallback(() => {
    try {
      // Используем ws:// для локального сервера вместо wss://
      const wsUrl = `ws://localhost:3001`;
      
      console.log('🔗 Попытка подключения к серверу синхронизации:', wsUrl);
      
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log('✅ WebSocket подключен к серверу синхронизации');
        setIsConnected(true);
        setConnectionAttempts(0);
        
        // Запрашиваем текущие данные с сервера
        wsRef.current?.send(JSON.stringify({ type: 'request-sync' }));
      };

      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('📥 Получено от сервера:', data.type);
          
          if (data.type === 'init') {
            // Инициализация данных с сервера
            console.log('🔄 Инициализация данных с сервера');
            
            if (data.queueData) {
              window.dispatchEvent(new CustomEvent('server-queue-sync', { 
                detail: data.queueData 
              }));
            }
            
            if (data.settingsData) {
              window.dispatchEvent(new CustomEvent('server-settings-sync', { 
                detail: data.settingsData 
              }));
            }
          }
          
          if (data.type === 'queue-sync') {
            console.log('📥 Синхронизация очереди от сервера');
            window.dispatchEvent(new CustomEvent('server-queue-sync', { 
              detail: data.data 
            }));
          }
          
          if (data.type === 'settings-sync') {
            console.log('📥 Синхронизация настроек от сервера');
            window.dispatchEvent(new CustomEvent('server-settings-sync', { 
              detail: data.data 
            }));
          }
          
        } catch (error) {
          console.error('❌ Ошибка при обработке сообщения от сервера:', error);
        }
      };

      wsRef.current.onclose = () => {
        console.log('⚠️ Соединение с сервером потеряно');
        setIsConnected(false);
        setConnectionAttempts(prev => prev + 1);
        
        // Переподключение с задержкой
        const delay = Math.min(3000, 1000 * connectionAttempts);
        console.log(`🔄 Попытка переподключения через ${delay}ms...`);
        
        reconnectTimeoutRef.current = setTimeout(connectWebSocket, delay);
      };

      wsRef.current.onerror = (error) => {
        console.error('❌ Ошибка WebSocket:', error);
        setIsConnected(false);
      };

    } catch (error) {
      console.error('❌ Не удалось создать WebSocket соединение:', error);
      setIsConnected(false);
      setConnectionAttempts(prev => prev + 1);
      
      const delay = Math.min(5000, 1000 * connectionAttempts);
      reconnectTimeoutRef.current = setTimeout(connectWebSocket, delay);
    }
  }, [connectionAttempts]);

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
  }, [connectWebSocket]);

  const broadcastUpdate = useCallback((type: 'queue-update' | 'settings-update', data: any) => {
    console.log(`📤 Отправка ${type} на сервер:`, data);
    
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      try {
        wsRef.current.send(JSON.stringify({ type, data }));
        console.log(`✅ ${type} успешно отправлен на сервер`);
      } catch (error) {
        console.error(`❌ Ошибка при отправке ${type}:`, error);
      }
    } else {
      console.log(`⚠️ WebSocket не подключен, не могу отправить ${type}`);
    }
  }, []);

  const requestSync = useCallback(() => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'request-sync' }));
      console.log('📤 Запрошена принудительная синхронизация');
    }
  }, []);

  return { 
    broadcastUpdate, 
    isConnected,
    requestSync
  };
};
