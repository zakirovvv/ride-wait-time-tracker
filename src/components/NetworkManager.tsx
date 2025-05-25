
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useWebRTCSync } from '@/hooks/useWebRTCSync';
import { toast } from '@/hooks/use-toast';
import { Wifi, WifiOff, Users, Monitor, Smartphone } from 'lucide-react';

export const NetworkManager = () => {
  const { 
    isHost, 
    isConnected, 
    connectedPeers, 
    deviceId, 
    startAsHost, 
    connectToHost, 
    disconnect 
  } = useWebRTCSync();
  
  const [isConnecting, setIsConnecting] = useState(false);

  const handleStartAsHost = async () => {
    try {
      setIsConnecting(true);
      await startAsHost();
      toast({
        title: "Хост запущен",
        description: "Устройство готово принимать подключения"
      });
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось запустить хост",
        variant: "destructive"
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleConnectToHost = async () => {
    try {
      setIsConnecting(true);
      await connectToHost();
      toast({
        title: "Подключение",
        description: "Попытка подключения к хосту..."
      });
    } catch (error: any) {
      toast({
        title: "Ошибка подключения",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    disconnect();
    toast({
      title: "Отключение",
      description: "Соединение разорвано"
    });
  };

  return (
    <Card className="bg-white/95 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center text-xl">
          {isConnected ? (
            <Wifi className="w-5 h-5 mr-2 text-green-600" />
          ) : (
            <WifiOff className="w-5 h-5 mr-2 text-gray-400" />
          )}
          Локальная сеть
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Информация об устройстве */}
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="text-sm text-gray-600">ID устройства:</div>
          <div className="font-mono text-sm">{deviceId}</div>
          <div className="text-xs text-gray-500 mt-1">
            {isHost ? '👑 Хост' : isConnected ? '📱 Клиент' : '💤 Не подключен'}
          </div>
        </div>

        {/* Статус соединения */}
        {isConnected && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center text-green-700">
              <Users className="w-4 h-4 mr-2" />
              Подключенные устройства: {connectedPeers.length}
            </div>
            {connectedPeers.length > 0 && (
              <div className="text-xs text-green-600 mt-1">
                {connectedPeers.map((peerId, index) => (
                  <span key={peerId}>
                    {peerId}{index < connectedPeers.length - 1 ? ', ' : ''}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Кнопки управления */}
        {!isConnected && !isHost && (
          <div className="space-y-2">
            <Button
              onClick={handleStartAsHost}
              disabled={isConnecting}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              <Monitor className="w-4 h-4 mr-2" />
              {isConnecting ? 'Запуск...' : 'Запустить как хост'}
            </Button>
            
            <Button
              onClick={handleConnectToHost}
              disabled={isConnecting}
              variant="outline"
              className="w-full"
            >
              <Smartphone className="w-4 h-4 mr-2" />
              {isConnecting ? 'Подключение...' : 'Подключиться к хосту'}
            </Button>
          </div>
        )}

        {(isConnected || isHost) && (
          <Button
            onClick={handleDisconnect}
            variant="destructive"
            className="w-full"
          >
            Отключиться
          </Button>
        )}

        {/* Инструкции */}
        <div className="text-xs text-gray-600 space-y-1">
          <div>💡 <strong>Хост:</strong> главное устройство для кассы</div>
          <div>📱 <strong>Клиент:</strong> подключается к хосту</div>
          <div>🔄 Данные синхронизируются автоматически</div>
        </div>
      </CardContent>
    </Card>
  );
};
