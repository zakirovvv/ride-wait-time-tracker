import { create } from 'zustand';
import { QueueEntry, QueueSummary } from '@/types';
import { attractions } from '@/data/attractions';
import { useAttractionSettingsStore } from '@/stores/attractionSettingsStore';

interface QueueState {
  queue: QueueEntry[];
  queueSummary: QueueSummary[];
  addToQueue: (entry: Omit<QueueEntry, 'id' | 'timeAdded' | 'estimatedTime' | 'position'>) => void;
  removeFromQueue: (braceletCode: string) => void;
  getAttractionQueue: (attractionId: string) => QueueEntry[];
  updateQueueSummary: () => void;
  loadFromStorage: () => void;
  saveToStorage: () => void;
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
        set({ queue, queueSummary });
        console.log('Loaded queue from storage:', queue.length, 'entries');
      }
    } catch (error) {
      console.error('Error loading queue from storage:', error);
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
      
      console.log('Saved queue to localStorage and sent to server');
    } catch (error) {
      console.error('Error saving queue to storage:', error);
    }
  },

  updateQueueSummary: () => {
    const currentQueue = get().queue;
    const newSummary = calculateQueueSummary(currentQueue);
    set({ queueSummary: newSummary });
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
    console.log('Added to queue:', newEntry);
  },

  removeFromQueue: (braceletCode) => {
    console.log('Attempting to remove bracelet code:', braceletCode);
    
    const currentQueue = get().queue;
    const entryToRemove = currentQueue.find(q => q.braceletCode === braceletCode);
    
    if (!entryToRemove) {
      console.log('Entry not found for bracelet code:', braceletCode);
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
    console.log('Successfully removed entry for bracelet code:', braceletCode);
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
    console.log('Received queue sync from another device');
    const queueData = event.detail;
    if (queueData && Array.isArray(queueData)) {
      localStorage.setItem('park-queue', JSON.stringify(queueData));
      useQueueStore.getState().loadFromStorage();
    }
  });
}
