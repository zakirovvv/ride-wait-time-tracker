import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useQueueStore } from '@/stores/queueStore';
import { useStaffStore } from '@/stores/staffStore';
import { attractions } from '@/data/attractions';
import { toast } from '@/hooks/use-toast';
import { Users, CheckCircle, Clock, LogOut, AlertCircle } from 'lucide-react';
export const InstructorInterface = () => {
  const [braceletCodeToComplete, setBraceletCodeToComplete] = useState('');
  const {
    currentUser,
    logout
  } = useStaffStore();
  const {
    removeFromQueue,
    getAttractionQueue
  } = useQueueStore();
  const attractionId = currentUser?.attractionId;
  const attraction = attractions.find(a => a.id === attractionId);

  // Получаем очередь и обновляем её автоматически
  const [queue, setQueue] = useState(() => attractionId ? getAttractionQueue(attractionId) : []);

  // Обновляем очередь при изменениях
  useEffect(() => {
    if (attractionId) {
      const updateQueue = () => {
        const currentQueue = getAttractionQueue(attractionId);
        setQueue(currentQueue);
      };
      updateQueue();

      // Обновляем каждые 500ms для синхронизации
      const interval = setInterval(updateQueue, 500);
      return () => clearInterval(interval);
    }
  }, [attractionId, getAttractionQueue]);
  const handleCompleteRide = (braceletCode: string, customerName: string) => {
    console.log('Instructor completing ride for:', braceletCode, customerName);
    removeFromQueue(braceletCode);

    // Немедленно обновляем локальное состояние
    if (attractionId) {
      const updatedQueue = getAttractionQueue(attractionId);
      setQueue(updatedQueue);
    }
    toast({
      title: "Катание завершено!",
      description: `${customerName} (${braceletCode}) успешно прокатился`
    });
    console.log('Ride completion processed');
  };
  const handleQuickComplete = () => {
    const trimmedCode = braceletCodeToComplete.trim().toUpperCase();
    console.log('Quick complete attempt for code:', trimmedCode);
    if (!trimmedCode) {
      toast({
        title: "Ошибка",
        description: "Введите код браслета",
        variant: "destructive"
      });
      return;
    }
    const entry = queue.find(q => q.braceletCode.toUpperCase() === trimmedCode);
    console.log('Found entry:', entry);
    console.log('Available entries:', queue.map(q => q.braceletCode));
    if (entry) {
      handleCompleteRide(entry.braceletCode, entry.customerName);
      setBraceletCodeToComplete('');
    } else {
      console.log('Entry not found for code:', trimmedCode);
      toast({
        title: "Браслет не найден",
        description: "Проверьте код браслета",
        variant: "destructive"
      });
    }
  };
  const handleLogout = () => {
    logout();
    toast({
      title: "Выход выполнен",
      description: "До свидания!"
    });
  };
  if (!attraction) {
    return <div className="min-h-screen bg-red-500 flex items-center justify-center">
        <Card>
          <CardContent className="p-6">
            <p className="text-red-600">Ошибка: аттракцион не найден</p>
          </CardContent>
        </Card>
      </div>;
  }
  return <div className="min-h-screen bg-gradient-to-br from-purple-600 via-indigo-500 to-blue-500 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Заголовок */}
        <div className="flex justify-between items-center mb-8">
          <div className="text-center flex-1">
            <h1 className="text-4xl font-bold text-white mb-4 drop-shadow-lg">
              {attraction.icon} Инструктор - {attraction.name}
            </h1>
            <p className="text-lg text-white/90 drop-shadow">
              Управление очередью и проведение аттракциона
            </p>
          </div>
          <div className="text-right">
            <div className="text-white mb-2">
              <span className="font-semibold">{currentUser?.name}</span>
            </div>
            <Button onClick={handleLogout} variant="outline" className="bg-white/20 text-white border-white/30 hover:bg-white/30">
              <LogOut className="w-4 h-4 mr-2" />
              Выход
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Информация об аттракционе */}
          

          {/* Быстрое завершение */}
          

          {/* Статус очереди */}
          
        </div>

        {/* Полная очередь */}
        <Card className="mt-6 bg-white/95 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center text-2xl text-gray-800">
              <Users className="w-6 h-6 mr-2 text-blue-600" />
              Очередь аттракциона
            </CardTitle>
          </CardHeader>
          <CardContent>
            {queue.length === 0 ? <div className="text-center py-8 text-gray-500">
                <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Очередь пуста</p>
              </div> : <div className="space-y-3">
                {queue.map((entry, index) => <div key={entry.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-4">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-800">{entry.customerName}</div>
                        <div className="text-sm text-gray-500">
                          Браслет: {entry.braceletCode}
                        </div>
                        <div className="text-xs text-gray-400">
                          Ожидаемое время: {entry.estimatedTime.toLocaleTimeString('ru-RU', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                        </div>
                      </div>
                    </div>
                    <Button onClick={() => handleCompleteRide(entry.braceletCode, entry.customerName)} className="bg-green-600 hover:bg-green-700 text-white" size="sm">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Завершить
                    </Button>
                  </div>)}
              </div>}
          </CardContent>
        </Card>
      </div>
    </div>;
};