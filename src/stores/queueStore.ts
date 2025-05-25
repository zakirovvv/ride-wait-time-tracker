
import { create } from 'zustand';
import { QueueEntry, QueueSummary } from '@/types';
import { attractions } from '@/data/attractions';

interface QueueState {
  queue: QueueEntry[];
  addToQueue: (entry: Omit<QueueEntry, 'id' | 'timeAdded' | 'estimatedTime' | 'position'>) => void;
  removeFromQueue: (braceletCode: string) => void;
  getQueueSummary: () => QueueSummary[];
  getAttractionQueue: (attractionId: string) => QueueEntry[];
}

export const useQueueStore = create<QueueState>((set, get) => ({
  queue: [],

  addToQueue: (entry) => {
    const currentQueue = get().queue;
    const attractionQueue = currentQueue.filter(q => q.attractionId === entry.attractionId);
    const attraction = attractions.find(a => a.id === entry.attractionId);
    
    if (!attraction) return;

    const position = attractionQueue.length + 1;
    const timeAdded = new Date();
    const estimatedTime = new Date(timeAdded.getTime() + (position * attraction.duration * 60000));

    const newEntry: QueueEntry = {
      ...entry,
      id: Math.random().toString(36).substr(2, 9),
      timeAdded,
      estimatedTime,
      position
    };

    set({ queue: [...currentQueue, newEntry] });
  },

  removeFromQueue: (braceletCode) => {
    const currentQueue = get().queue;
    const entryToRemove = currentQueue.find(q => q.braceletCode === braceletCode);
    
    if (!entryToRemove) return;
    
    // Simply filter out the entry without recalculating positions immediately
    const filteredQueue = currentQueue.filter(q => q.braceletCode !== braceletCode);
    
    // Only recalculate positions for the affected attraction
    const affectedAttractionId = entryToRemove.attractionId;
    const attraction = attractions.find(a => a.id === affectedAttractionId);
    
    if (!attraction) {
      set({ queue: filteredQueue });
      return;
    }

    // Recalculate only for the affected attraction
    const updatedQueue = filteredQueue.map(entry => {
      if (entry.attractionId === affectedAttractionId) {
        const attractionEntries = filteredQueue.filter(q => q.attractionId === affectedAttractionId);
        const newPosition = attractionEntries.findIndex(q => q.id === entry.id) + 1;
        const newEstimatedTime = new Date(Date.now() + (newPosition * attraction.duration * 60000));
        
        return { ...entry, position: newPosition, estimatedTime: newEstimatedTime };
      }
      return entry;
    });

    set({ queue: updatedQueue });
  },

  getQueueSummary: () => {
    const currentQueue = get().queue;
    
    return attractions.map(attraction => {
      const attractionQueue = currentQueue.filter(q => q.attractionId === attraction.id);
      const queueLength = attractionQueue.length;
      const estimatedWaitTime = queueLength * attraction.duration;
      const nextAvailableTime = new Date(Date.now() + (estimatedWaitTime * 60000));

      return {
        attractionId: attraction.id,
        attractionName: attraction.name,
        queueLength,
        estimatedWaitTime,
        nextAvailableTime
      };
    });
  },

  getAttractionQueue: (attractionId) => {
    const currentQueue = get().queue;
    return currentQueue
      .filter(q => q.attractionId === attractionId)
      .sort((a, b) => a.position - b.position);
  }
}));
