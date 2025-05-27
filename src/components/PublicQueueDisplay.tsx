import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useSupabaseQueue } from '@/hooks/useSupabaseQueue';
import { useSupabaseSettings } from '@/hooks/useSupabaseSettings';
import { attractions } from '@/data/attractions';
import { Clock, Users, Timer } from 'lucide-react';
export const PublicQueueDisplay = () => {
  const {
    queueSummary,
    isLoading
  } = useSupabaseQueue();
  const {
    getDuration
  } = useSupabaseSettings();
  const getStatusColor = (waitTime: number) => {
    if (waitTime === 0) return 'text-green-600 bg-green-50';
    if (waitTime <= 15) return 'text-yellow-600 bg-yellow-50';
    if (waitTime <= 30) return 'text-orange-600 bg-orange-50';
    return 'text-red-600 bg-red-50';
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
  if (isLoading) {
    return <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 flex items-center justify-center">
        <div className="text-white text-xl">Загрузка...</div>
      </div>;
  }
  return <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-4 drop-shadow-lg">
            🎢 Информация по аттракционам
          </h1>
          <p className="text-xl text-white/90 drop-shadow">Выберите развлечение с минимальным временем ожидания!</p>
          <div className="text-lg text-white/80 mt-2">
            Обновлено: {new Date().toLocaleTimeString('ru-RU', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          })}
          </div>
        </div>

        <Card className="bg-white/95 backdrop-blur-sm shadow-2xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl text-center text-gray-800">
              📊 Состояние очередей
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-b-2">
                  <TableHead className="text-center font-bold text-gray-700">Развлечения</TableHead>
                  <TableHead className="text-center font-bold text-gray-700">
                    <div className="flex items-center justify-center gap-2">
                      <Users className="w-4 h-4" />
                      В очереди
                    </div>
                  </TableHead>
                  <TableHead className="text-center font-bold text-gray-700">
                    <div className="flex items-center justify-center gap-2">
                      <Clock className="w-4 h-4" />
                      Ожидание
                    </div>
                  </TableHead>
                  <TableHead className="text-center font-bold text-gray-700">
                    <div className="flex items-center justify-center gap-2">
                      <Timer className="w-4 h-4" />
                      Длительность
                    </div>
                  </TableHead>
                  <TableHead className="text-center font-bold text-gray-700">Статус</TableHead>
                  <TableHead className="text-center font-bold text-gray-700">Время прохода</TableHead>
                  <TableHead className="text-center font-bold text-gray-700">Рекомендация</TableHead>
                </TableRow>
              </TableHeader>
              
              <TableBody>
                {queueSummary.filter(summary => {
                const attraction = attractions.find(a => a.id === summary.attractionId);
                return attraction && attraction.isActive;
              }).sort((a, b) => a.estimatedWaitTime - b.estimatedWaitTime).map(summary => {
                const attraction = attractions.find(a => a.id === summary.attractionId);
                if (!attraction) return null;

                // Получаем актуальную длительность из настроек
                const currentDuration = getDuration(attraction.id);
                const nextAvailableTime = new Date(Date.now() + summary.estimatedWaitTime * 60000);
                return <TableRow key={summary.attractionId} className="hover:bg-gray-50 transition-colors">
                        <TableCell className="text-center">
                          <div className="flex items-center gap-3 justify-center">
                            <span className="text-2xl">{attraction.icon}</span>
                            <div>
                              <div className="font-semibold text-gray-800">{attraction.name}</div>
                              <div className="text-sm text-gray-500">{attraction.description}</div>
                            </div>
                          </div>
                        </TableCell>
                        
                        <TableCell className="text-center">
                          <span className="font-bold text-xl text-blue-600">
                            {summary.queueLength} чел.
                          </span>
                        </TableCell>
                        
                        <TableCell className="text-center">
                          <span className="font-bold text-xl text-orange-600">
                            {summary.estimatedWaitTime === 0 ? 'Сейчас' : `${summary.estimatedWaitTime} мин`}
                          </span>
                        </TableCell>
                        
                        <TableCell className="text-center">
                          <span className="font-semibold text-gray-600">
                            {currentDuration} мин
                          </span>
                        </TableCell>
                        
                        <TableCell className="text-center">
                          <span className={`${getStatusColor(summary.estimatedWaitTime)} px-3 py-1 rounded-full text-sm font-bold`}>
                            {getStatusText(summary.estimatedWaitTime)}
                          </span>
                        </TableCell>
                        
                        <TableCell className="text-center">
                          {summary.estimatedWaitTime > 0 ? <div className="text-center">
                              <div className="font-bold text-blue-700">
                                {nextAvailableTime.toLocaleTimeString('ru-RU', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                              </div>
                              <div className="text-xs text-gray-500">
                                если купить сейчас
                              </div>
                            </div> : <div className="text-center">
                              <div className="font-bold text-green-700">
                                ✅ Сразу
                              </div>
                              <div className="text-xs text-green-600">
                                можете проходить
                              </div>
                            </div>}
                        </TableCell>
                        
                        <TableCell className="text-center">
                          <span className="font-bold text-purple-600">
                            {getRecommendation(summary.estimatedWaitTime)}
                          </span>
                        </TableCell>
                      </TableRow>;
              })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Совет и легенда */}
        <div className="mt-8 space-y-4">
          <Card className="bg-white/90 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <h3 className="text-xl font-bold text-gray-800 mb-3">💡 Совет посетителям</h3>
              <p className="text-gray-700 text-lg">Развлечения отсортированы по времени ожидания - сверху самые свободные!</p>
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
    </div>;
};