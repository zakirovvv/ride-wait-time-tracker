
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
}

const calculateQueueSummary = (queue: QueueEntry[]): QueueSummary[] => {
  return attractions.map(attraction => {
    const attractionQueue = queue.filter(q => q.attractionId === attraction.id);
    const queueLength = attractionQueue.length;
    
    // Получаем актуальное время из настроек
    const currentDuration = useAttractionSettingsStore.getState().getDuration(attraction.id);
    
    // Первый человек идет сразу, остальные ждут
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

    // Получаем актуальное время из настроек
    const currentDuration = useAttractionSettingsStore.getState().getDuration(attraction.id);

    const position = attractionQueue.length + 1;
    const timeAdded = new Date();
    // Первый человек (position = 1) идет сразу, остальные ждут
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
    
    console.log('Added to queue:', newEntry);
    console.log('New queue length:', newQueue.length);
  },

  removeFromQueue: (braceletCode) => {
    console.log('Attempting to remove bracelet code:', braceletCode);
    
    const currentQueue = get().queue;
    console.log('Current queue before removal:', currentQueue.length, 'entries');
    
    const entryToRemove = currentQueue.find(q => q.braceletCode === braceletCode);
    
    if (!entryToRemove) {
      console.log('Entry not found for bracelet code:', braceletCode);
      console.log('Available bracelet codes:', currentQueue.map(q => q.braceletCode));
      return;
    }
    
    console.log('Found entry to remove:', entryToRemove);
    
    // Simply filter out the entry
    const filteredQueue = currentQueue.filter(q => q.braceletCode !== braceletCode);
    console.log('Queue after filtering:', filteredQueue.length, 'entries');
    
    // Only recalculate positions for the affected attraction
    const affectedAttractionId = entryToRemove.attractionId;
    const attraction = attractions.find(a => a.id === affectedAttractionId);
    
    if (!attraction) {
      const newSummary = calculateQueueSummary(filteredQueue);
      set({ queue: filteredQueue, queueSummary: newSummary });
      console.log('Updated queue (no attraction found):', filteredQueue.length);
      return;
    }

    // Получаем актуальное время из настроек
    const currentDuration = useAttractionSettingsStore.getState().getDuration(attraction.id);

    // Recalculate only for the affected attraction
    const updatedQueue = filteredQueue.map(entry => {
      if (entry.attractionId === affectedAttractionId) {
        const attractionEntries = filteredQueue.filter(q => q.attractionId === affectedAttractionId);
        const newPosition = attractionEntries.findIndex(q => q.id === entry.id) + 1;
        // Первый человек идет сразу, остальные ждут
        const waitTime = newPosition === 1 ? 0 : (newPosition - 1) * currentDuration;
        const newEstimatedTime = new Date(Date.now() + (waitTime * 60000));
        
        console.log(`Updated position for ${entry.braceletCode}: ${entry.position} -> ${newPosition}`);
        
        return { ...entry, position: newPosition, estimatedTime: newEstimatedTime };
      }
      return entry;
    });

    const newSummary = calculateQueueSummary(updatedQueue);
    set({ queue: updatedQueue, queueSummary: newSummary });
    
    console.log('Final updated queue:', updatedQueue.length, 'entries');
    console.log('Successfully removed entry for bracelet code:', braceletCode);
  },

  getAttractionQueue: (attractionId) => {
    const currentQueue = get().queue;
    const attractionQueue = currentQueue
      .filter(q => q.attractionId === attractionId)
      .sort((a, b) => a.position - b.position);
    
    console.log(`Getting queue for attraction ${attractionId}:`, attractionQueue.length, 'entries');
    return attractionQueue;
  }
}));

// Функция для автоматического обновления очередей при изменении настроек
export const updateQueuesWhenSettingsChange = () => {
  useQueueStore.getState().updateQueueSummary();
};
