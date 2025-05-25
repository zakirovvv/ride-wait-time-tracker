
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQueueStore } from '@/stores/queueStore';
import { useStaffStore } from '@/stores/staffStore';
import { attractions } from '@/data/attractions';
import { toast } from '@/hooks/use-toast';
import { Trash2, Settings, Users, Clock, CheckCircle, LogOut, AlertCircle } from 'lucide-react';

export const OperatorInterface = () => {
  const [selectedAttraction, setSelectedAttraction] = useState('');
  const [braceletCodeToRemove, setBraceletCodeToRemove] = useState('');
  const [braceletCodeToComplete, setBraceletCodeToComplete] = useState('');
  
  const {
    currentUser,
    logout
  } = useStaffStore();
  
  const {
    removeFromQueue,
    getAttractionQueue
  } = useQueueStore();
  
  const queueSummary = useQueueStore(state => state.queueSummary);

  const currentQueue = selectedAttraction ? getAttractionQueue(selectedAttraction) : [];
  const currentAttraction = attractions.find(a => a.id === selectedAttraction);

  // Обновляем очередь при изменениях для выбранного аттракциона
  const [queue, setQueue] = useState(() => selectedAttraction ? getAttractionQueue(selectedAttraction) : []);

  useEffect(() => {
    if (selectedAttraction) {
      const updateQueue = () => {
        const currentQueue = getAttractionQueue(selectedAttraction);
        setQueue(currentQueue);
      };
      updateQueue();

      // Обновляем каждые 500ms для синхронизации
      const interval = setInterval(updateQueue, 500);
      return () => clearInterval(interval);
    }
  }, [selectedAttraction, getAttractionQueue]);

  const handleRemoveFromQueue = () => {
    if (!braceletCodeToRemove.trim()) {
      toast({
        title: "Ошибка",
        description: "Введите код браслета",
        variant: "destructive"
      });
      return;
    }

    removeFromQueue(braceletCodeToRemove.trim());
    
    toast({
      title: "Посетитель обслужен!",
      description: `Браслет ${braceletCodeToRemove} убран из очереди`,
    });

    setBraceletCodeToRemove('');

    // Обновляем локальную очередь
    if (selectedAttraction) {
      const updatedQueue = getAttractionQueue(selectedAttraction);
      setQueue(updatedQueue);
    }
  };

  const handleCompleteRide = (braceletCode: string, customerName: string) => {
    console.log('Admin completing ride for:', braceletCode, customerName);
    removeFromQueue(braceletCode);

    // Немедленно обновляем локальное состояние
    if (selectedAttraction) {
      const updatedQueue = getAttractionQueue(selectedAttraction);
      setQueue(updatedQueue);
    }
    
    toast({
      title: "Катание завершено!",
      description: `${customerName} (${braceletCode}) успешно прокатился`,
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Заголовок с кнопкой выхода */}
        <div className="flex justify-between items-center mb-8">
          <div className="text-center flex-1">
            <h1 className="text-4xl font-bold text-white mb-4 drop-shadow-lg">
              ⚙️ Панель Администратора
            </h1>
            <p className="text-lg text-white/90 drop-shadow">
              Управляйте очередями и обслуживайте посетителей
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

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Выбор аттракциона */}
          <Card className="bg-white/95 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center text-xl text-gray-800">
                <Settings className="w-5 h-5 mr-2 text-orange-600" />
                Выбор аттракциона
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Label htmlFor="attraction" className="text-gray-700">
                Аттракцион для управления
              </Label>
              <Select value={selectedAttraction} onValueChange={setSelectedAttraction}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Выберите аттракцион..." />
                </SelectTrigger>
                <SelectContent>
                  {attractions.filter(a => a.isActive).map((attraction) => (
                    <SelectItem key={attraction.id} value={attraction.id}>
                      <div className="flex items-center">
                        <span className="mr-2">{attraction.icon}</span>
                        <span>{attraction.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {currentAttraction && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600">
                    <div>Длительность: {currentAttraction.duration} мин</div>
                    <div>Вместимость: {currentAttraction.capacity} чел</div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Быстрое завершение катания */}
          <Card className="bg-white/95 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center text-xl text-gray-800">
                <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
                Завершить катание
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="quickComplete" className="text-gray-700">
                  Код браслета для завершения
                </Label>
                <Input
                  id="quickComplete"
                  value={braceletCodeToComplete}
                  onChange={(e) => setBraceletCodeToComplete(e.target.value.toUpperCase())}
                  placeholder="Например: BR1A2B3C"
                  className="mt-1"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleQuickComplete();
                    }
                  }}
                />
              </div>
              <Button 
                onClick={handleQuickComplete}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
                disabled={!selectedAttraction}
              >
                <CheckCircle className="w-4 h-4 mr-1" />
                Завершить катание
              </Button>
              {!selectedAttraction && (
                <p className="text-xs text-gray-500 text-center">
                  Выберите аттракцион для завершения катания
                </p>
              )}
            </CardContent>
          </Card>

          {/* Удаление из очереди (старая функция) */}
          <Card className="bg-white/95 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center text-xl text-gray-800">
                <Trash2 className="w-5 h-5 mr-2 text-red-600" />
                Убрать из очереди
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="braceletCode" className="text-gray-700">
                  Код браслета
                </Label>
                <Input
                  id="braceletCode"
                  value={braceletCodeToRemove}
                  onChange={(e) => setBraceletCodeToRemove(e.target.value.toUpperCase())}
                  placeholder="Например: BR1A2B3C"
                  className="mt-1"
                />
              </div>
              <Button 
                onClick={handleRemoveFromQueue}
                className="w-full bg-red-600 hover:bg-red-700 text-white"
              >
                Убрать из очереди
              </Button>
            </CardContent>
          </Card>

          {/* Статистика */}
          <Card className="bg-white/95 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center text-xl text-gray-800">
                <Users className="w-5 h-5 mr-2 text-blue-600" />
                Общая статистика
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {queueSummary.map((summary) => {
                  const attraction = attractions.find(a => a.id === summary.attractionId);
                  if (!attraction) return null;

                  return (
                    <div key={summary.attractionId} className="flex items-center justify-between text-sm">
                      <div className="flex items-center">
                        <span className="mr-2">{attraction.icon}</span>
                        <span className="truncate">{attraction.name}</span>
                      </div>
                      <span className="font-semibold text-blue-600">
                        {summary.queueLength}
                      </span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Информация о выбранном аттракционе и статус очереди */}
        {selectedAttraction && currentAttraction && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
            <Card className="bg-white/95 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center text-xl text-gray-800">
                  <AlertCircle className="w-5 h-5 mr-2 text-blue-600" />
                  Информация об аттракционе
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-center text-6xl mb-4">
                    {currentAttraction.icon}
                  </div>
                  <div className="text-center">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                      {currentAttraction.name}
                    </h3>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex justify-between">
                        <span>Длительность:</span>
                        <span className="font-semibold">{currentAttraction.duration} мин</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Вместимость:</span>
                        <span className="font-semibold">{currentAttraction.capacity} чел</span>
                      </div>
                      <div className="flex justify-between">
                        <span>В очереди:</span>
                        <span className="font-semibold text-blue-600">{queue.length} чел</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2 bg-white/95 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center text-xl text-gray-800">
                  <Clock className="w-5 h-5 mr-2 text-blue-600" />
                  Статус очереди
                </CardTitle>
              </CardHeader>
              <CardContent>
                {queue.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Очередь пуста</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="text-sm text-gray-600 mb-4">
                      Следующие в очереди:
                    </div>
                    {queue.slice(0, 3).map((entry, index) => (
                      <div key={entry.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center">
                          <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-3">
                            {index + 1}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-800 text-sm">{entry.customerName}</div>
                            <div className="text-xs text-gray-500">
                              {entry.braceletCode}
                            </div>
                          </div>
                        </div>
                        <Button
                          onClick={() => handleCompleteRide(entry.braceletCode, entry.customerName)}
                          className="bg-green-600 hover:bg-green-700 text-white"
                          size="sm"
                        >
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Готово
                        </Button>
                      </div>
                    ))}
                    {queue.length > 3 && (
                      <div className="text-center text-sm text-gray-500 pt-2">
                        и ещё {queue.length - 3} человек в очереди
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Полная очередь выбранного аттракциона */}
        {selectedAttraction && (
          <Card className="mt-6 bg-white/95 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center text-2xl text-gray-800">
                <Users className="w-6 h-6 mr-2 text-blue-600" />
                Полная очередь: {currentAttraction?.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {queue.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Очередь пуста</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {queue.map((entry, index) => (
                    <div key={entry.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
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
                      <Button
                        onClick={() => handleCompleteRide(entry.braceletCode, entry.customerName)}
                        className="bg-green-600 hover:bg-green-700 text-white"
                        size="sm"
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Завершить
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
