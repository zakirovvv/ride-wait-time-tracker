
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQueueStore } from '@/stores/queueStore';
import { attractions } from '@/data/attractions';
import { toast } from '@/hooks/use-toast';
import { Trash2, Settings, Users, Clock, CheckCircle } from 'lucide-react';

export const OperatorInterface = () => {
  const [selectedAttraction, setSelectedAttraction] = useState('');
  const [braceletCodeToRemove, setBraceletCodeToRemove] = useState('');
  
  const removeFromQueue = useQueueStore(state => state.removeFromQueue);
  const getAttractionQueue = useQueueStore(state => state.getAttractionQueue);
  const queueSummary = useQueueStore(state => state.getQueueSummary());

  const currentQueue = selectedAttraction ? getAttractionQueue(selectedAttraction) : [];
  const currentAttraction = attractions.find(a => a.id === selectedAttraction);

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
  };

  const handleCompleteRide = (braceletCode: string, customerName: string) => {
    removeFromQueue(braceletCode);
    
    toast({
      title: "Катание завершено!",
      description: `${customerName} (${braceletCode}) успешно прокатился`,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4 drop-shadow-lg">
            ⚙️ Панель Оператора
          </h1>
          <p className="text-lg text-white/90 drop-shadow">
            Управляйте очередями и обслуживайте посетителей
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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

          {/* Быстрое удаление */}
          <Card className="bg-white/95 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center text-xl text-gray-800">
                <Trash2 className="w-5 h-5 mr-2 text-red-600" />
                Завершить катание
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
                <Users className="w-5 h-5 mr-2 text-green-600" />
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

        {/* Очередь выбранного аттракциона */}
        {selectedAttraction && (
          <Card className="mt-8 bg-white/95 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center text-2xl text-gray-800">
                <Clock className="w-6 h-6 mr-2 text-blue-600" />
                Очередь: {currentAttraction?.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {currentQueue.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Очередь пуста</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {currentQueue.map((entry, index) => (
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
