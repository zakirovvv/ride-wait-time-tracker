
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useQueueStore } from '@/stores/queueStore';
import { useAttractionSettingsStore } from '@/stores/attractionSettingsStore';
import { attractions } from '@/data/attractions';
import { Clock, Users } from 'lucide-react';

interface VisitorDashboardProps {
  selectedAttraction?: string | null;
}

export const VisitorDashboard = ({ selectedAttraction }: VisitorDashboardProps) => {
  const queueSummary = useQueueStore(state => state.queueSummary);
  const { getDuration } = useAttractionSettingsStore();

  const getWaitTimeColor = (waitTime: number) => {
    if (waitTime <= 15) return 'bg-green-500';
    if (waitTime <= 30) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getWaitTimeText = (waitTime: number) => {
    if (waitTime === 0) return 'Нет очереди';
    if (waitTime <= 5) return 'Очень быстро';
    if (waitTime <= 15) return 'Быстро';
    if (waitTime <= 30) return 'Умеренно';
    return 'Долго';
  };

  // Фильтруем аттракционы если выбран конкретный
  const filteredSummary = selectedAttraction 
    ? queueSummary.filter(s => s.attractionId === selectedAttraction)
    : queueSummary;

  const titleText = selectedAttraction 
    ? `${attractions.find(a => a.id === selectedAttraction)?.name} - Очередь`
    : '🏞️ Парк Приключений';

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-yellow-400 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-4 drop-shadow-lg">
            {titleText}
          </h1>
          <p className="text-xl text-white/90 drop-shadow">
            {selectedAttraction 
              ? 'Информация об очереди для выбранного аттракциона'
              : 'Узнайте время ожидания и выберите свой аттракцион!'
            }
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSummary.map((summary) => {
            const attraction = attractions.find(a => a.id === summary.attractionId);
            if (!attraction) return null;

            // Получаем актуальную длительность из настроек
            const currentDuration = getDuration(attraction.id);

            return (
              <Card key={summary.attractionId} className="bg-white/95 backdrop-blur-sm hover:bg-white transition-all duration-300 hover:scale-105 hover:shadow-xl border-0">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="text-4xl">{attraction.icon}</div>
                    <Badge 
                      className={`${getWaitTimeColor(summary.estimatedWaitTime)} text-white px-3 py-1`}
                    >
                      {getWaitTimeText(summary.estimatedWaitTime)}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl text-gray-800">
                    {attraction.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4 text-sm">
                    {attraction.description}
                  </p>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-gray-700">
                        <Users className="w-4 h-4 mr-2" />
                        <span className="text-sm">В очереди:</span>
                      </div>
                      <span className="font-semibold text-purple-600">
                        {summary.queueLength} чел.
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-gray-700">
                        <Clock className="w-4 h-4 mr-2" />
                        <span className="text-sm">Ожидание:</span>
                      </div>
                      <span className="font-semibold text-purple-600">
                        {summary.estimatedWaitTime === 0 ? 'Сейчас' : `${summary.estimatedWaitTime} мин`}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-gray-700">
                        <Clock className="w-4 h-4 mr-2" />
                        <span className="text-sm">Длительность:</span>
                      </div>
                      <span className="font-semibold text-purple-600">
                        {currentDuration} мин
                      </span>
                    </div>

                    {summary.estimatedWaitTime > 0 && (
                      <div className="text-xs text-gray-500 text-center pt-2 border-t">
                        Примерное время: {summary.nextAvailableTime.toLocaleTimeString('ru-RU', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-8 text-center">
          <Card className="bg-white/90 backdrop-blur-sm max-w-md mx-auto">
            <CardContent className="p-4">
              <p className="text-sm text-gray-600">
                💡 <strong>Совет:</strong> Время ожидания обновляется в реальном времени
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
