
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

export interface AttractionSetting {
  attractionId: string;
  duration: number;
  capacity: number;
  isActive: boolean;
}

export interface PeerMessage {
  type: 'queue_update' | 'settings_update' | 'ping' | 'init';
  data: any;
  timestamp: number;
  deviceId: string;
}

export interface PeerConnection {
  id: string;
  connection: RTCPeerConnection;
  dataChannel?: RTCDataChannel;
  isConnected: boolean;
  isHost: boolean;
}
