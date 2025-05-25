
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQueueStore } from '@/stores/queueStore';
import { attractions } from '@/data/attractions';
import { Clock, Users, Timer } from 'lucide-react';

export const CashierDisplay = () => {
  const queueSummary = useQueueStore(state => state.queueSummary);

  const getStatusColor = (waitTime: number) => {
    if (waitTime === 0) return 'bg-green-500';
    if (waitTime <= 15) return 'bg-yellow-500';
    if (waitTime <= 30) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getStatusText = (waitTime: number) => {
    if (waitTime === 0) return 'Свободно';
    if (waitTime <= 15) return 'Мало очереди';
    if (waitTime <= 30) return 'Средняя очередь';
    return 'Большая очередь';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-4 drop-shadow-lg">
            📊 Информационное табло кассы
          </h1>
          <p className="text-xl text-white/90 drop-shadow">
            Актуальная информация по всем аттракционам
          </p>
          <div className="text-lg text-white/80 mt-2">
            Текущее время: {new Date().toLocaleTimeString('ru-RU', { 
              hour: '2-digit', 
              minute: '2-digit',
              second: '2-digit'
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {queueSummary.map((summary) => {
            const attraction = attractions.find(a => a.id === summary.attractionId);
            if (!attraction || !attraction.isActive) return null;

            const nextAvailableTime = new Date(Date.now() + (summary.estimatedWaitTime * 60000));

            return (
              <Card key={summary.attractionId} className="bg-white/95 backdrop-blur-sm border-2 hover:scale-105 transition-all duration-300">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="text-3xl">{attraction.icon}</div>
                    <div 
                      className={`${getStatusColor(summary.estimatedWaitTime)} text-white px-2 py-1 rounded-full text-xs font-bold`}
                    >
                      {getStatusText(summary.estimatedWaitTime)}
                    </div>
                  </div>
                  <CardTitle className="text-lg text-gray-800 leading-tight">
                    {attraction.name}
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="space-y-3">
                  {/* Количество в очереди */}
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="flex items-center text-gray-700">
                      <Users className="w-4 h-4 mr-2" />
                      <span className="text-sm">В очереди:</span>
                    </div>
                    <span className="font-bold text-lg text-blue-600">
                      {summary.queueLength} чел.
                    </span>
                  </div>

                  {/* Время ожидания */}
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="flex items-center text-gray-700">
                      <Clock className="w-4 h-4 mr-2" />
                      <span className="text-sm">Ожидание:</span>
                    </div>
                    <span className="font-bold text-lg text-orange-600">
                      {summary.estimatedWaitTime === 0 ? 'Сейчас' : `${summary.estimatedWaitTime} мин`}
                    </span>
                  </div>

                  {/* Длительность аттракциона */}
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="flex items-center text-gray-700">
                      <Timer className="w-3 h-3 mr-2" />
                      <span className="text-sm">Длительность:</span>
                    </div>
                    <span className="font-semibold text-gray-600">
                      {attraction.duration} мин
                    </span>
                  </div>

                  {/* Время когда сможет пройти новый посетитель */}
                  {summary.estimatedWaitTime > 0 && (
                    <div className="text-center p-2 bg-blue-50 rounded border border-blue-200">
                      <div className="text-xs text-gray-600 mb-1">Новый посетитель сможет пройти:</div>
                      <div className="font-bold text-blue-700">
                        {nextAvailableTime.toLocaleTimeString('ru-RU', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </div>
                    </div>
                  )}

                  {summary.estimatedWaitTime === 0 && (
                    <div className="text-center p-2 bg-green-50 rounded border border-green-200">
                      <div className="font-bold text-green-700">
                        ✅ Можно проходить сразу!
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Легенда */}
        <div className="mt-8">
          <Card className="bg-white/90 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex flex-wrap justify-center gap-4 text-sm">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                  <span>Свободно (0 мин)</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                  <span>Мало очереди (до 15 мин)</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-orange-500 rounded-full mr-2"></div>
                  <span>Средняя очередь (15-30 мин)</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                  <span>Большая очередь (30+ мин)</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
