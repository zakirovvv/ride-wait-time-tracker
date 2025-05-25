
import { useEffect, useRef, useState } from 'react';
import { PeerMessage, PeerConnection } from '@/types';

export const useWebRTCSync = () => {
  const [isHost, setIsHost] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [connectedPeers, setConnectedPeers] = useState<string[]>([]);
  const peersRef = useRef<Map<string, PeerConnection>>(new Map());
  const deviceIdRef = useRef<string>(
    localStorage.getItem('device-id') || Math.random().toString(36).substr(2, 9)
  );

  useEffect(() => {
    localStorage.setItem('device-id', deviceIdRef.current);
  }, []);

  const createPeerConnection = (peerId: string, isInitiator: boolean): RTCPeerConnection => {
    const config: RTCConfiguration = {
      iceServers: [], // Работаем только в локальной сети
    };

    const pc = new RTCPeerConnection(config);
    
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        // В реальной реализации здесь была бы отправка candidate через сигналинг сервер
        // Для локальной сети используем простой механизм через localStorage
        const candidates = JSON.parse(localStorage.getItem(`ice-candidates-${peerId}`) || '[]');
        candidates.push({
          candidate: event.candidate,
          from: deviceIdRef.current,
          timestamp: Date.now()
        });
        localStorage.setItem(`ice-candidates-${peerId}`, JSON.stringify(candidates));
      }
    };

    pc.onconnectionstatechange = () => {
      console.log(`Connection state: ${pc.connectionState}`);
      setIsConnected(pc.connectionState === 'connected');
    };

    return pc;
  };

  const broadcastMessage = (message: Omit<PeerMessage, 'deviceId' | 'timestamp'>) => {
    const fullMessage: PeerMessage = {
      ...message,
      deviceId: deviceIdRef.current,
      timestamp: Date.now()
    };

    // Отправляем через localStorage для простоты (fallback)
    localStorage.setItem('last-broadcast', JSON.stringify(fullMessage));
    
    // Отправляем через все WebRTC соединения
    peersRef.current.forEach((peer) => {
      if (peer.dataChannel && peer.dataChannel.readyState === 'open') {
        try {
          peer.dataChannel.send(JSON.stringify(fullMessage));
        } catch (error) {
          console.error('Error sending message:', error);
        }
      }
    });

    console.log('Broadcasting message:', fullMessage.type);
  };

  const startAsHost = async () => {
    setIsHost(true);
    localStorage.setItem('network-host', deviceIdRef.current);
    localStorage.setItem('host-timestamp', Date.now().toString());
    
    // Слушаем подключения от других устройств
    const checkForClients = () => {
      const hostRequests = JSON.parse(localStorage.getItem('host-requests') || '[]');
      const newRequests = hostRequests.filter((req: any) => 
        Date.now() - req.timestamp < 30000 && // Только свежие запросы
        req.targetHost === deviceIdRef.current &&
        !peersRef.current.has(req.clientId)
      );

      newRequests.forEach(async (request: any) => {
        await connectToPeer(request.clientId, true);
      });
    };

    const interval = setInterval(checkForClients, 2000);
    return () => clearInterval(interval);
  };

  const connectToHost = async () => {
    const hostId = localStorage.getItem('network-host');
    const hostTimestamp = localStorage.getItem('host-timestamp');
    
    if (!hostId || !hostTimestamp || Date.now() - parseInt(hostTimestamp) > 60000) {
      throw new Error('Хост не найден или устарел');
    }

    // Отправляем запрос на подключение
    const requests = JSON.parse(localStorage.getItem('host-requests') || '[]');
    requests.push({
      clientId: deviceIdRef.current,
      targetHost: hostId,
      timestamp: Date.now()
    });
    localStorage.setItem('host-requests', JSON.stringify(requests));

    await connectToPeer(hostId, false);
  };

  const connectToPeer = async (peerId: string, isInitiator: boolean) => {
    const pc = createPeerConnection(peerId, isInitiator);
    
    if (isInitiator) {
      // Хост создает data channel
      const dataChannel = pc.createDataChannel('sync', {
        ordered: true
      });
      
      dataChannel.onopen = () => {
        console.log('Data channel opened as host');
        setConnectedPeers(prev => [...prev.filter(id => id !== peerId), peerId]);
      };
      
      dataChannel.onmessage = handleDataChannelMessage;
      
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      
      // Сохраняем offer для клиента
      localStorage.setItem(`offer-${peerId}`, JSON.stringify({
        offer,
        from: deviceIdRef.current,
        timestamp: Date.now()
      }));
      
    } else {
      // Клиент ждет data channel от хоста
      pc.ondatachannel = (event) => {
        const dataChannel = event.channel;
        dataChannel.onopen = () => {
          console.log('Data channel opened as client');
          setConnectedPeers(prev => [...prev.filter(id => id !== peerId), peerId]);
        };
        dataChannel.onmessage = handleDataChannelMessage;
      };

      // Ждем offer от хоста
      const waitForOffer = () => {
        const offerData = localStorage.getItem(`offer-${deviceIdRef.current}`);
        if (offerData) {
          const { offer } = JSON.parse(offerData);
          pc.setRemoteDescription(offer).then(async () => {
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            
            // Сохраняем answer для хоста
            localStorage.setItem(`answer-${peerId}`, JSON.stringify({
              answer,
              from: deviceIdRef.current,
              timestamp: Date.now()
            }));
          });
          return true;
        }
        return false;
      };

      if (!waitForOffer()) {
        const interval = setInterval(() => {
          if (waitForOffer()) {
            clearInterval(interval);
          }
        }, 1000);
      }
    }

    peersRef.current.set(peerId, {
      id: peerId,
      connection: pc,
      isConnected: false,
      isHost: isInitiator
    });
  };

  const handleDataChannelMessage = (event: MessageEvent) => {
    try {
      const message: PeerMessage = JSON.parse(event.data);
      if (message.deviceId === deviceIdRef.current) return; // Игнорируем свои сообщения

      console.log('Received sync message:', message.type);
      
      switch (message.type) {
        case 'queue_update':
          window.dispatchEvent(new CustomEvent('queue-sync', { detail: message.data }));
          break;
        case 'settings_update':
          window.dispatchEvent(new CustomEvent('settings-sync', { detail: message.data }));
          break;
      }
    } catch (error) {
      console.error('Error handling message:', error);
    }
  };

  const disconnect = () => {
    peersRef.current.forEach((peer) => {
      peer.connection.close();
    });
    peersRef.current.clear();
    setConnectedPeers([]);
    setIsConnected(false);
    setIsHost(false);
    localStorage.removeItem('network-host');
    localStorage.removeItem('host-timestamp');
  };

  return {
    isHost,
    isConnected,
    connectedPeers,
    deviceId: deviceIdRef.current,
    startAsHost,
    connectToHost,
    broadcastMessage,
    disconnect
  };
};
