
import { useEffect } from 'react';

export const useBroadcastSync = () => {
  useEffect(() => {
    // Слушаем изменения localStorage от других вкладок/устройств
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'park-queue' && event.newValue) {
        console.log('Queue updated from another device');
        window.dispatchEvent(new CustomEvent('queue-sync', { 
          detail: JSON.parse(event.newValue) 
        }));
      }
      
      if (event.key === 'park-settings' && event.newValue) {
        console.log('Settings updated from another device');
        window.dispatchEvent(new CustomEvent('settings-sync', { 
          detail: JSON.parse(event.newValue) 
        }));
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Простая функция для совместимости (не используется в новой архитектуре)
  const broadcastUpdate = (type: string, data: any) => {
    console.log('Data automatically synced through localStorage:', type);
  };

  return { broadcastUpdate, isConnected: true };
};
