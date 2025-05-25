
export interface Attraction {
  id: string;
  name: string;
  duration: number; // время на одного человека в минутах
  capacity: number; // максимальная вместимость
  isActive: boolean;
  description: string;
  icon: string;
}

export interface QueueEntry {
  id: string;
  attractionId: string;
  braceletCode: string;
  customerName: string;
  timeAdded: Date;
  estimatedTime: Date;
  position: number;
}

export interface QueueSummary {
  attractionId: string;
  attractionName: string;
  queueLength: number;
  estimatedWaitTime: number; // в минутах
  nextAvailableTime: Date;
}
