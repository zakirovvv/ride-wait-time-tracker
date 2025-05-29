
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { useSupabaseQueue } from '@/hooks/useSupabaseQueue';
import { useSupabaseSettings } from '@/hooks/useSupabaseSettings';
import { attractions } from '@/data/attractions';
import { toast } from '@/hooks/use-toast';
import { Ticket, Clock, LogOut, Timer, Settings, Plus } from 'lucide-react';
import { AttractionSettings } from './AttractionSettings';

export const CashierInterface = () => {
  const [showSettings, setShowSettings] = useState(false);
  const [nextBraceletNumber, setNextBraceletNumber] = useState(1);
  
  const { currentUser, logout } = useSupabaseAuth();
  const { queueSummary, addToQueue, isLoading: queueLoading } = useSupabaseQueue();
  const { getDuration } = useSupabaseSettings();

  const handleAddToQueue = async (attractionId: string) => {
    try {
      const braceletCode = nextBraceletNumber.toString();
      
      await addToQueue(braceletCode, attractionId);

      toast({
        title: "Билет продан!",
        description: `Браслет номер ${braceletCode} добавлен в очередь`,
      });

      setNextBraceletNumber(prev => prev + 1);
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось добавить в очередь",
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
            <div className="text-sm text-white/70 mt-2">
              Следующий номер браслета: <span className="font-bold text-yellow-300">{nextBraceletNumber}</span>
            </div>
          </div>
          <div className="text-right flex flex-col space-y-2">
            <div className="text-white mb-2">
              <span className="font-semibold">{currentUser?.name}</span>
            </div>
            <Button
              onClick={() => setShowSettings(true)}
              variant="outline"
              className="bg-white/20 text-white border-white/30 hover:bg-white/30"
            >
              <Settings className="w-4 h-4 mr-2" />
              Настройки
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
                    
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-gray-600">
                        Длительность:
                      </div>
                      <span className="font-semibold text-gray-700">
                        {currentDuration} мин
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
                      #{nextBraceletNumber}
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
            <CardTitle className="flex items-center text-2xl text-gray-800">
              <Ticket className="w-6 h-6 mr-2 text-blue-600" />
              Общая статистика
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
                  {nextBraceletNumber - 1}
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
                  {nextBraceletNumber}
                </div>
                <div className="text-sm text-gray-600">Следующий номер</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
