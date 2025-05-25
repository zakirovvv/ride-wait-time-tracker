
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQueueStore } from '@/stores/queueStore';
import { attractions } from '@/data/attractions';
import { Clock, Users, Timer } from 'lucide-react';

export const PublicQueueDisplay = () => {
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

  const getRecommendation = (waitTime: number) => {
    if (waitTime === 0) return '🎯 Идеальное время!';
    if (waitTime <= 15) return '👍 Хорошее время';
    if (waitTime <= 30) return '⏰ Подождать стоит';
    return '❌ Долгое ожидание';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-4 drop-shadow-lg">
            🎢 Информация по аттракционам
          </h1>
          <p className="text-xl text-white/90 drop-shadow">
            Выберите аттракцион с минимальным временем ожидания!
          </p>
          <div className="text-lg text-white/80 mt-2">
            Обновлено: {new Date().toLocaleTimeString('ru-RU', { 
              hour: '2-digit', 
              minute: '2-digit',
              second: '2-digit'
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {queueSummary
            .filter(summary => {
              const attraction = attractions.find(a => a.id === summary.attractionId);
              return attraction && attraction.isActive;
            })
            .sort((a, b) => a.estimatedWaitTime - b.estimatedWaitTime)
            .map((summary) => {
              const attraction = attractions.find(a => a.id === summary.attractionId);
              if (!attraction) return null;

              const nextAvailableTime = new Date(Date.now() + (summary.estimatedWaitTime * 60000));

              return (
                <Card key={summary.attractionId} className="bg-white/95 backdrop-blur-sm border-2 hover:scale-105 transition-all duration-300 shadow-xl">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-4xl">{attraction.icon}</div>
                      <div 
                        className={`${getStatusColor(summary.estimatedWaitTime)} text-white px-3 py-1 rounded-full text-sm font-bold`}
                      >
                        {getStatusText(summary.estimatedWaitTime)}
                      </div>
                    </div>
                    <CardTitle className="text-xl text-gray-800 leading-tight">
                      {attraction.name}
                    </CardTitle>
                    <div className="text-center py-2">
                      <span className="text-lg font-bold text-purple-600">
                        {getRecommendation(summary.estimatedWaitTime)}
                      </span>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {/* Количество в очереди */}
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center text-gray-700">
                        <Users className="w-5 h-5 mr-2" />
                        <span className="font-medium">В очереди:</span>
                      </div>
                      <span className="font-bold text-xl text-blue-600">
                        {summary.queueLength} чел.
                      </span>
                    </div>

                    {/* Время ожидания */}
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center text-gray-700">
                        <Clock className="w-5 h-5 mr-2" />
                        <span className="font-medium">Ожидание:</span>
                      </div>
                      <span className="font-bold text-xl text-orange-600">
                        {summary.estimatedWaitTime === 0 ? 'Сейчас' : `${summary.estimatedWaitTime} мин`}
                      </span>
                    </div>

                    {/* Длительность аттракциона */}
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center text-gray-700">
                        <Timer className="w-5 h-5 mr-2" />
                        <span className="font-medium">Длительность:</span>
                      </div>
                      <span className="font-semibold text-gray-600">
                        {attraction.duration} мин
                      </span>
                    </div>

                    {/* Время когда можно будет пройти */}
                    {summary.estimatedWaitTime > 0 ? (
                      <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="text-sm text-gray-600 mb-1">Если купить билет сейчас:</div>
                        <div className="font-bold text-blue-700 text-lg">
                          Можете пройти в {nextAvailableTime.toLocaleTimeString('ru-RU', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
                        <div className="font-bold text-green-700 text-lg">
                          ✅ Можете проходить сразу!
                        </div>
                        <div className="text-sm text-green-600">
                          Идите к кассе за билетом
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
        </div>

        {/* Совет и легенда */}
        <div className="mt-8 space-y-4">
          <Card className="bg-white/90 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <h3 className="text-xl font-bold text-gray-800 mb-3">💡 Совет посетителям</h3>
              <p className="text-gray-700 text-lg">
                Аттракционы отсортированы по времени ожидания - сверху самые свободные!
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex flex-wrap justify-center gap-6 text-sm">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-green-500 rounded-full mr-2"></div>
                  <span>Свободно (0 мин)</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-yellow-500 rounded-full mr-2"></div>
                  <span>Мало очереди (до 15 мин)</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-orange-500 rounded-full mr-2"></div>
                  <span>Средняя очередь (15-30 мин)</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-red-500 rounded-full mr-2"></div>
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
