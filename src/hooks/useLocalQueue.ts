
import { useState, useEffect } from 'react';
import { attractions } from '@/data/attractions';

export interface LocalQueueEntry {
  id: string;
  attraction_id: string;
  bracelet_code: string;
  customer_name: string;
  position: number;
  estimated_time: string;
  created_at: string;
  status: 'active' | 'completed' | 'cancelled';
  completed_by?: string;
  completed_at?: string;
}

interface QueueSummary {
  attractionId: string;
  attractionName: string;
  queueLength: number;
  estimatedWaitTime: number;
  nextAvailableTime: Date;
}

const QUEUE_STORAGE_KEY = 'local_queue_data';

export const useLocalQueue = () => {
  const [queue, setQueue] = useState<LocalQueueEntry[]>([]);
  const [queueSummary, setQueueSummary] = useState<QueueSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Загрузка данных из localStorage при инициализации
  useEffect(() => {
    loadQueue();
    
    // Подписка на WebSocket обновления
    const ws = new WebSocket(`ws://${window.location.hostname}:3001`);
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'queue-sync') {
        setQueue(data.data || []);
        calculateQueueSummary(data.data || []);
      }
    };

    ws.onopen = () => {
      console.log('🔗 Подключено к локальному серверу синхронизации');
    };

    ws.onerror = (error) => {
      console.warn('⚠️ Ошибка подключения к серверу синхронизации:', error);
    };

    return () => {
      ws.close();
    };
  }, []);

  const loadQueue = () => {
    try {
      const savedQueue = localStorage.getItem(QUEUE_STORAGE_KEY);
      if (savedQueue) {
        const parsedQueue = JSON.parse(savedQueue);
        setQueue(parsedQueue);
        calculateQueueSummary(parsedQueue);
      } else {
        calculateQueueSummary([]);
      }
    } catch (error) {
      console.error('Ошибка загрузки очереди:', error);
      calculateQueueSummary([]);
    } finally {
      setIsLoading(false);
    }
  };

  const saveQueue = (newQueue: LocalQueueEntry[]) => {
    try {
      localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(newQueue));
      
      // Отправляем обновление на WebSocket сервер
      const ws = new WebSocket(`ws://${window.location.hostname}:3001`);
      ws.onopen = () => {
        ws.send(JSON.stringify({
          type: 'queue-update',
          data: newQueue
        }));
        ws.close();
      };
    } catch (error) {
      console.error('Ошибка сохранения очереди:', error);
    }
  };

  const calculateQueueSummary = (queueData: LocalQueueEntry[]) => {
    const settings = JSON.parse(localStorage.getItem('local_attraction_settings') || '[]');
    
    const summary = attractions.map(attraction => {
      const attractionQueue = queueData.filter(q => 
        q.attraction_id === attraction.id && q.status === 'active'
      );
      const queueLength = attractionQueue.length;
      
      const setting = settings.find((s: any) => s.attraction_id === attraction.id);
      const duration = setting?.duration || attraction.duration;
      
      const estimatedWaitTime = queueLength > 0 ? (queueLength - 1) * duration : 0;
      const nextAvailableTime = new Date(Date.now() + (estimatedWaitTime * 60000));

      return {
        attractionId: attraction.id,
        attractionName: attraction.name,
        queueLength,
        estimatedWaitTime,
        nextAvailableTime
      };
    });

    setQueueSummary(summary);
  };

  const addToQueue = async (braceletCode: string, attractionId: string) => {
    try {
      const currentQueue = queue.filter(q => q.status === 'active');
      const attractionQueue = currentQueue.filter(q => q.attraction_id === attractionId);
      const nextPosition = attractionQueue.length + 1;

      const settings = JSON.parse(localStorage.getItem('local_attraction_settings') || '[]');
      const setting = settings.find((s: any) => s.attraction_id === attractionId);
      const duration = setting?.duration || 5;

      const waitTime = nextPosition === 1 ? 0 : (nextPosition - 1) * duration;
      const estimatedTime = new Date(Date.now() + (waitTime * 60000));

      const newEntry: LocalQueueEntry = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
        attraction_id: attractionId,
        bracelet_code: braceletCode.toUpperCase(),
        customer_name: braceletCode.toUpperCase(),
        position: nextPosition,
        estimated_time: estimatedTime.toISOString(),
        created_at: new Date().toISOString(),
        status: 'active'
      };

      const updatedQueue = [...queue, newEntry];
      setQueue(updatedQueue);
      calculateQueueSummary(updatedQueue);
      saveQueue(updatedQueue);

      console.log('✅ Билет добавлен в локальную очередь:', braceletCode);
    } catch (error) {
      console.error('Ошибка добавления в очередь:', error);
      throw error;
    }
  };

  const removeFromQueue = async (braceletCode: string, completedBy?: string) => {
    try {
      const existingTicket = queue.find(entry => 
        entry.bracelet_code === braceletCode && entry.status === 'active'
      );

      if (!existingTicket) {
        throw new Error(`Билет с кодом ${braceletCode} не найден`);
      }

      const updatedQueue = queue.map(entry => 
        entry.bracelet_code === braceletCode && entry.status === 'active'
          ? {
              ...entry,
              status: 'completed' as const,
              completed_at: new Date().toISOString(),
              completed_by: completedBy || null
            }
          : entry
      );

      setQueue(updatedQueue);
      calculateQueueSummary(updatedQueue);
      saveQueue(updatedQueue);

      console.log('✅ Билет завершен в локальной системе:', braceletCode);
    } catch (error) {
      console.error('❌ Ошибка в removeFromQueue:', error);
      throw error;
    }
  };

  const getAttractionQueue = (attractionId: string) => {
    return queue
      .filter(q => q.attraction_id === attractionId && q.status === 'active')
      .sort((a, b) => a.position - b.position);
  };

  return {
    queue: queue.filter(q => q.status === 'active'),
    queueSummary,
    isLoading,
    addToQueue,
    removeFromQueue,
    getAttractionQueue,
    refreshQueue: loadQueue
  };
};
