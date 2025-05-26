
import { create } from 'zustand';
import { QueueEntry, QueueSummary } from '@/types';
import { attractions } from '@/data/attractions';
import { useAttractionSettingsStore } from '@/stores/attractionSettingsStore';

interface QueueState {
  queue: QueueEntry[];
  queueSummary: QueueSummary[];
  lastUpdate: number;
  addToQueue: (entry: Omit<QueueEntry, 'id' | 'timeAdded' | 'estimatedTime' | 'position'>) => void;
  removeFromQueue: (braceletCode: string) => void;
  getAttractionQueue: (attractionId: string) => QueueEntry[];
  updateQueueSummary: () => void;
  loadFromStorage: () => void;
  saveToStorage: () => void;
  forceUpdate: () => void;
}

const calculateQueueSummary = (queue: QueueEntry[]): QueueSummary[] => {
  return attractions.map(attraction => {
    const attractionQueue = queue.filter(q => q.attractionId === attraction.id);
    const queueLength = attractionQueue.length;
    
    const currentDuration = useAttractionSettingsStore.getState().getDuration(attraction.id);
    
    const estimatedWaitTime = queueLength > 0 ? (queueLength - 1) * currentDuration : 0;
    const nextAvailableTime = new Date(Date.now() + (estimatedWaitTime * 60000));

    return {
      attractionId: attraction.id,
      attractionName: attraction.name,
      queueLength,
      estimatedWaitTime,
      nextAvailableTime
    };
  });
};

export const useQueueStore = create<QueueState>((set, get) => ({
  queue: [],
  queueSummary: calculateQueueSummary([]),
  lastUpdate: Date.now(),

  forceUpdate: () => {
    set({ lastUpdate: Date.now() });
  },

  loadFromStorage: () => {
    try {
      const stored = localStorage.getItem('park-queue');
      if (stored) {
        const data = JSON.parse(stored);
        const queue = data.map((entry: any) => ({
          ...entry,
          timeAdded: new Date(entry.timeAdded),
          estimatedTime: new Date(entry.estimatedTime)
        }));
        
        const queueSummary = calculateQueueSummary(queue);
        set({ queue, queueSummary, lastUpdate: Date.now() });
        console.log('✅ Загружена очередь из хранилища:', queue.length, 'записей');
      }
    } catch (error) {
      console.error('❌ Ошибка при загрузке очереди:', error);
    }
  },

  saveToStorage: () => {
    try {
      const { queue } = get();
      localStorage.setItem('park-queue', JSON.stringify(queue));
      
      // Отправляем обновления на сервер
      if (window.broadcastQueueUpdate) {
        window.broadcastQueueUpdate(queue);
      }
      
      // Принудительно обновляем состояние для всех подписчиков
      set({ lastUpdate: Date.now() });
      
      console.log('💾 Очередь сохранена и отправлена на сервер');
    } catch (error) {
      console.error('❌ Ошибка при сохранении очереди:', error);
    }
  },

  updateQueueSummary: () => {
    const currentQueue = get().queue;
    const newSummary = calculateQueueSummary(currentQueue);
    set({ queueSummary: newSummary, lastUpdate: Date.now() });
  },

  addToQueue: (entry) => {
    const currentQueue = get().queue;
    const attractionQueue = currentQueue.filter(q => q.attractionId === entry.attractionId);
    const attraction = attractions.find(a => a.id === entry.attractionId);
    
    if (!attraction) return;

    const currentDuration = useAttractionSettingsStore.getState().getDuration(attraction.id);

    const position = attractionQueue.length + 1;
    const timeAdded = new Date();
    const waitTime = position === 1 ? 0 : (position - 1) * currentDuration;
    const estimatedTime = new Date(timeAdded.getTime() + (waitTime * 60000));

    const newEntry: QueueEntry = {
      ...entry,
      id: Math.random().toString(36).substr(2, 9),
      timeAdded,
      estimatedTime,
      position
    };

    const newQueue = [...currentQueue, newEntry];
    const newSummary = calculateQueueSummary(newQueue);
    set({ queue: newQueue, queueSummary: newSummary });
    
    get().saveToStorage();
    console.log('➕ Добавлено в очередь:', newEntry);
  },

  removeFromQueue: (braceletCode) => {
    console.log('🗑️ Попытка удалить код браслета:', braceletCode);
    
    const currentQueue = get().queue;
    const entryToRemove = currentQueue.find(q => q.braceletCode === braceletCode);
    
    if (!entryToRemove) {
      console.log('❌ Запись не найдена для кода:', braceletCode);
      return;
    }
    
    const filteredQueue = currentQueue.filter(q => q.braceletCode !== braceletCode);
    const affectedAttractionId = entryToRemove.attractionId;
    const attraction = attractions.find(a => a.id === affectedAttractionId);
    
    if (!attraction) {
      const newSummary = calculateQueueSummary(filteredQueue);
      set({ queue: filteredQueue, queueSummary: newSummary });
      get().saveToStorage();
      return;
    }

    const currentDuration = useAttractionSettingsStore.getState().getDuration(attraction.id);

    const updatedQueue = filteredQueue.map(entry => {
      if (entry.attractionId === affectedAttractionId) {
        const attractionEntries = filteredQueue.filter(q => q.attractionId === affectedAttractionId);
        const newPosition = attractionEntries.findIndex(q => q.id === entry.id) + 1;
        const waitTime = newPosition === 1 ? 0 : (newPosition - 1) * currentDuration;
        const newEstimatedTime = new Date(Date.now() + (waitTime * 60000));
        
        return { ...entry, position: newPosition, estimatedTime: newEstimatedTime };
      }
      return entry;
    });

    const newSummary = calculateQueueSummary(updatedQueue);
    set({ queue: updatedQueue, queueSummary: newSummary });
    
    get().saveToStorage();
    console.log('✅ Успешно удален код браслета:', braceletCode);
  },

  getAttractionQueue: (attractionId) => {
    const currentQueue = get().queue;
    const attractionQueue = currentQueue
      .filter(q => q.attractionId === attractionId)
      .sort((a, b) => a.position - b.position);
    
    return attractionQueue;
  }
}));

export const updateQueuesWhenSettingsChange = () => {
  useQueueStore.getState().updateQueueSummary();
};

// Инициализация при загрузке приложения
if (typeof window !== 'undefined') {
  useQueueStore.getState().loadFromStorage();
  
  // Слушаем события синхронизации от других устройств
  window.addEventListener('queue-sync', (event: CustomEvent) => {
    console.log('🔄 Получена синхронизация очереди от другого устройства');
    const queueData = event.detail;
    if (queueData && Array.isArray(queueData)) {
      localStorage.setItem('park-queue', JSON.stringify(queueData));
      useQueueStore.getState().loadFromStorage();
    }
  });
}
