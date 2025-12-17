import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLocalAuth } from '@/hooks/useLocalAuth';
import { useSupabaseQueue } from '@/hooks/useSupabaseQueue';
import { useSupabaseSettings } from '@/hooks/useSupabaseSettings';
import { attractions } from '@/data/attractions';
import { toast } from '@/hooks/use-toast';
import { Ticket, Clock, LogOut, Timer, Settings, Plus, List, RotateCcw } from 'lucide-react';
import { AttractionSettings } from './AttractionSettings';
import { TicketManager } from './TicketManager';

export const CashierInterface = () => {
  const [showSettings, setShowSettings] = useState(false);
  const [showTicketManager, setShowTicketManager] = useState(false);
  
  // Функция для загрузки счетчиков из localStorage
  const loadCountersFromStorage = (): Record<string, number> => {
    try {
      const savedCounters = localStorage.getItem('braceletCounters');
      if (savedCounters) {
        const parsed = JSON.parse(savedCounters);
        // Проверяем, что у нас есть счетчики для всех аттракционов
        const initialCounters: Record<string, number> = {};
        attractions.forEach(attraction => {
          initialCounters[attraction.id] = parsed[attraction.id] || 1;
        });
        return initialCounters;
      }
    } catch (error) {
      console.error('Ошибка загрузки счетчиков:', error);
    }
    
    // Если ничего не сохранено или ошибка, создаем начальные счетчики
    const initialCounters: Record<string, number> = {};
    attractions.forEach(attraction => {
      initialCounters[attraction.id] = 1;
    });
    return initialCounters;
  };

  const [braceletCounters, setBraceletCounters] = useState<Record<string, number>>(loadCountersFromStorage);
  
  const { currentUser, logout } = useLocalAuth();
  const { queueSummary, addToQueue, isLoading: queueLoading } = useSupabaseQueue();
  const { getDuration } = useSupabaseSettings();

  // Сохраняем счетчики в localStorage при каждом изменении
  useEffect(() => {
    localStorage.setItem('braceletCounters', JSON.stringify(braceletCounters));
  }, [braceletCounters]);

  const handleAddToQueue = async (attractionId: string) => {
    try {
      const currentNumber = braceletCounters[attractionId];
      const braceletCode = `${attractionId.toUpperCase()}-${currentNumber}`;
      
      await addToQueue(braceletCode, attractionId);

      toast({
        title: "Билет продан!",
        description: `Браслет номер ${braceletCode} добавлен в очередь`,
      });

      // Увеличиваем счетчик только для этого аттракциона
      setBraceletCounters(prev => ({
        ...prev,
        [attractionId]: prev[attractionId] + 1
      }));
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось добавить в очередь",
        variant: "destructive"
      });
    }
  };

  const handleResetCounters = () => {
    const resetCounters: Record<string, number> = {};
    attractions.forEach(attraction => {
      resetCounters[attraction.id] = 1;
    });
    setBraceletCounters(resetCounters);
    
    toast({
      title: "Счетчики сброшены",
      description: "Все счетчики браслетов сброшены до 1",
    });
  };

  const handleLogout = () => {
    logout();
    toast({
      title: "Выход выполнен",
      description: "До свидания!"
    });
  };

  if (showTicketManager) {
    return <TicketManager onClose={() => setShowTicketManager(false)} />;
  }

  if (showSettings) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-green-500 to-teal-400 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold text-white drop-shadow-lg">
              ⚙️ Настройки аттракционов
            </h1>
            <Button
              onClick={() => setShowSettings(false)}
              variant="outline"
              className="bg-white/20 text-white border-white/30 hover:bg-white/30"
            >
              Назад к продаже билетов
            </Button>
          </div>
          <AttractionSettings />
        </div>
      </div>
    );
  }

  if (queueLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-green-500 to-teal-400 flex items-center justify-center">
        <div className="text-white text-xl">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-green-500 to-teal-400 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="text-center flex-1">
            <h1 className="text-4xl font-bold text-white mb-4 drop-shadow-lg">
              🎫 Касса - Продажа Билетов
            </h1>
            <p className="text-lg text-white/90 drop-shadow">
              Выберите аттракцион и добавьте посетителя в очередь
            </p>
          </div>
          <div className="text-right flex flex-col space-y-2">
            <div className="text-white mb-2">
              <span className="font-semibold">{currentUser?.name}</span>
            </div>
            <Button
              onClick={() => setShowTicketManager(true)}
              variant="outline"
              className="bg-white/20 text-white border-white/30 hover:bg-white/30"
            >
              <List className="w-4 h-4 mr-2" />
              Управление билетами
            </Button>
            <Button
              onClick={() => setShowSettings(true)}
              variant="outline"
              className="bg-white/20 text-white border-white/30 hover:bg-white/30"
            >
              <Settings className="w-4 h-4 mr-2" />
              Настройки
            </Button>
            <Button
              onClick={handleResetCounters}
              variant="outline"
              className="bg-white/20 text-white border-white/30 hover:bg-white/30"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Сбросить счетчики
            </Button>
            <Button 
              onClick={handleLogout}
              variant="outline"
              className="bg-white/20 text-white border-white/30 hover:bg-white/30"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Выход
            </Button>
          </div>
        </div>

        {/* Attractions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {attractions.filter(a => a.isActive).map((attraction) => {
            const summary = queueSummary.find(s => s.attractionId === attraction.id);
            const currentDuration = getDuration(attraction.id);
            const estimatedWaitTime = summary?.estimatedWaitTime || 0;
            const nextBraceletNumber = braceletCounters[attraction.id];

            return (
              <Card key={attraction.id} className="bg-white/95 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center text-xl text-gray-800">
                    <span className="text-3xl mr-3">{attraction.icon}</span>
                    <div>
                      <div className="font-bold">{attraction.name}</div>
                      <div className="text-sm text-gray-500 font-normal">{attraction.description}</div>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Queue Info */}
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="w-4 h-4 mr-1" />
                        В очереди:
                      </div>
                      <span className="font-bold text-blue-600">
                        {summary?.queueLength || 0} чел.
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center text-sm text-gray-600">
                        <Timer className="w-4 h-4 mr-1" />
                        Время ожидания:
                      </div>
                      <span className="font-bold text-orange-600">
                        {estimatedWaitTime === 0 ? 'Сейчас' : `${estimatedWaitTime} мин`}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center mb-2">
                      <div className="text-sm text-gray-600">
                        Длительность:
                      </div>
                      <span className="font-semibold text-gray-700">
                        {currentDuration} мин
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="text-sm text-gray-600">
                        Следующий номер:
                      </div>
                      <span className="font-bold text-purple-600">
                        {attraction.id.toUpperCase()}-{nextBraceletNumber}
                      </span>
                    </div>
                  </div>

                  {/* Add to Queue Button */}
                  <Button 
                    onClick={() => handleAddToQueue(attraction.id)}
                    className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white"
                    size="lg"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Добавить в очередь
                    <span className="ml-2 bg-white/20 px-2 py-1 rounded text-sm">
                      {attraction.id.toUpperCase()}-{nextBraceletNumber}
                    </span>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Summary Card */}
        <Card className="mt-8 bg-white/95 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-2xl text-gray-800">
              <div className="flex items-center">
                <Ticket className="w-6 h-6 mr-2 text-blue-600" />
                Общая статистика
              </div>
              <Button
                onClick={handleResetCounters}
                variant="outline"
                size="sm"
                className="text-red-600 border-red-600 hover:bg-red-50"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Сбросить все счетчики
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {queueSummary.reduce((sum, s) => sum + s.queueLength, 0)}
                </div>
                <div className="text-sm text-gray-600">Всего в очередях</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {Object.values(braceletCounters).reduce((sum, count) => sum + (count - 1), 0)}
                </div>
                <div className="text-sm text-gray-600">Билетов продано</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">
                  {attractions.filter(a => a.isActive).length}
                </div>
                <div className="text-sm text-gray-600">Активных аттракционов</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {Object.keys(braceletCounters).length}
                </div>
                <div className="text-sm text-gray-600">Аттракционов</div>
              </div>
            </div>
            
            {/* Detailed counters per attraction */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Счетчики по аттракционам:</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {attractions.filter(a => a.isActive).map((attraction) => (
                  <div key={attraction.id} className="bg-gray-50 rounded-lg p-3 text-center">
                    <div className="text-sm text-gray-600 mb-1">{attraction.name}</div>
                    <div className="font-bold text-lg text-purple-600">
                      {attraction.id.toUpperCase()}-{braceletCounters[attraction.id]}
                    </div>
                    <div className="text-xs text-gray-500">
                      Продано: {braceletCounters[attraction.id] - 1}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
