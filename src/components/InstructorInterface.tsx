
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQueueStore } from '@/stores/queueStore';
import { useStaffStore } from '@/stores/staffStore';
import { attractions } from '@/data/attractions';
import { toast } from '@/hooks/use-toast';
import { Users, CheckCircle, Clock, LogOut, AlertCircle, Settings } from 'lucide-react';

export const InstructorInterface = () => {
  const [selectedAttraction, setSelectedAttraction] = useState('');
  
  const {
    currentUser,
    logout,
    hasAdminPermissions
  } = useStaffStore();
  
  const {
    removeFromQueue,
    getAttractionQueue,
    queue: globalQueue // Подписываемся на глобальное состояние очереди
  } = useQueueStore();

  const isAdmin = hasAdminPermissions(currentUser);
  const attractionId = isAdmin ? selectedAttraction : currentUser?.attractionId;
  const attraction = attractions.find(a => a.id === attractionId);

  // Устанавливаем аттракцион для инструктора автоматически
  useEffect(() => {
    if (!isAdmin && currentUser?.attractionId) {
      setSelectedAttraction(currentUser.attractionId);
    }
  }, [currentUser, isAdmin]);

  // Получаем очередь напрямую из store, чтобы она обновлялась автоматически
  const queue = attractionId ? getAttractionQueue(attractionId) : [];

  // Добавляем console.log для отладки
  useEffect(() => {
    console.log('InstructorInterface: Current queue for attraction', attractionId, ':', queue.length, 'entries');
    console.log('InstructorInterface: Global queue size:', globalQueue.length);
  }, [queue, attractionId, globalQueue]);

  const handleCompleteRide = (braceletCode: string, customerName: string) => {
    console.log('Instructor completing ride for:', braceletCode, customerName);
    removeFromQueue(braceletCode);

    toast({
      title: "Катание завершено!",
      description: `${customerName} (${braceletCode}) успешно прокатился`
    });
    console.log('Ride completion processed');
  };

  const handleLogout = () => {
    logout();
    toast({
      title: "Выход выполнен",
      description: "До свидания!"
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-indigo-500 to-blue-500 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Заголовок */}
        <div className="flex justify-between items-center mb-8">
          <div className="text-center flex-1">
            <h1 className="text-4xl font-bold text-white mb-4 drop-shadow-lg">
              {isAdmin ? '⚙️ Панель Администратора - Управление Очередями' : `${attraction?.icon || '🎢'} Инструктор - ${attraction?.name || 'Аттракцион'}`}
            </h1>
            <p className="text-lg text-white/90 drop-shadow">
              {isAdmin ? 'Управление очередями всех аттракционов' : 'Управление очередью и проведение аттракциона'}
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Выбор аттракциона для админа */}
          {isAdmin && (
            <Card className="bg-white/95 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center text-xl text-gray-800">
                  <Settings className="w-5 h-5 mr-2 text-blue-600" />
                  Выбор аттракциона
                </CardTitle>
              </CardHeader>
              <CardContent>
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

                {attraction && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-600">
                      <div>Длительность: {attraction.duration} мин</div>
                      <div>Вместимость: {attraction.capacity} чел</div>
                      <div>В очереди: {queue.length} чел</div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Информация об аттракционе */}
          {attraction && (
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
                    {attraction.icon}
                  </div>
                  <div className="text-center">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                      {attraction.name}
                    </h3>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex justify-between">
                        <span>Длительность:</span>
                        <span className="font-semibold">{attraction.duration} мин</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Вместимость:</span>
                        <span className="font-semibold">{attraction.capacity} чел</span>
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
          )}
        </div>

        {/* Очередь для завершения */}
        {attraction && (
          <Card className="mt-6 bg-white/95 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center text-2xl text-gray-800">
                <Users className="w-6 h-6 mr-2 text-blue-600" />
                Очередь: {attraction.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {queue.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-xl">Очередь пуста</p>
                  <p className="text-sm mt-2">Посетители могут проходить сразу</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="text-sm text-gray-600 mb-4">
                    Нажмите "Завершить" когда посетитель закончил катание:
                  </div>
                  {queue.map((entry, index) => (
                    <div key={entry.id} className={`flex items-center justify-between p-4 rounded-lg border-2 ${
                      index === 0 
                        ? 'bg-green-50 border-green-200' 
                        : 'bg-gray-50 border-gray-200'
                    }`}>
                      <div className="flex items-center">
                        <div className={`rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-4 ${
                          index === 0 
                            ? 'bg-green-600 text-white' 
                            : 'bg-blue-600 text-white'
                        }`}>
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-800">{entry.customerName}</div>
                          <div className="text-sm text-gray-500">
                            Браслет: {entry.braceletCode}
                          </div>
                          <div className="text-xs text-gray-400 flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {index === 0 ? 'Сейчас катается' : `Время: ${entry.estimatedTime.toLocaleTimeString('ru-RU', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}`}
                          </div>
                        </div>
                      </div>
                      <Button
                        onClick={() => handleCompleteRide(entry.braceletCode, entry.customerName)}
                        className="bg-green-600 hover:bg-green-700 text-white"
                        size="lg"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
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
