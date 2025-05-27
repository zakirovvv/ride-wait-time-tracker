
import { useSupabaseQueue } from '@/hooks/useSupabaseQueue';
import { attractions } from '@/data/attractions';
import { Clock } from 'lucide-react';

interface QueueBoardProps {
  attractionId: string;
}

export const QueueBoard = ({ attractionId }: QueueBoardProps) => {
  const { getAttractionQueue } = useSupabaseQueue();
  
  const attraction = attractions.find(a => a.id === attractionId);
  const queue = getAttractionQueue(attractionId);

  if (!attraction) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-2xl">Аттракцион не найден</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      {/* Заголовок аттракциона */}
      <div className="text-center mb-12">
        <div className="text-6xl mb-4">{attraction.icon}</div>
        <h1 className="text-4xl font-bold mb-2">{attraction.name}</h1>
        <div className="text-xl text-gray-300">Очередь</div>
      </div>

      {/* Табло очереди */}
      {queue.length === 0 ? (
        <div className="text-center">
          <div className="text-3xl text-green-400 mb-4">✓ Очереди нет</div>
          <div className="text-xl text-gray-300">Можете проходить сразу</div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Заголовки таблицы */}
          <div className="grid grid-cols-3 gap-8 text-center bg-gray-800 p-4 rounded-lg">
            <div className="text-xl font-semibold text-yellow-400">№ ОЧЕРЕДИ</div>
            <div className="text-xl font-semibold text-yellow-400">КОД БРАСЛЕТА</div>
            <div className="text-xl font-semibold text-yellow-400">ВРЕМЯ ПОДХОДА</div>
          </div>

          {/* Строки очереди */}
          {queue.map((entry, index) => (
            <div 
              key={entry.id} 
              className={`grid grid-cols-3 gap-8 text-center p-6 rounded-lg border-2 ${
                index === 0 
                  ? 'bg-green-900 border-green-400 text-green-100' 
                  : 'bg-gray-900 border-gray-600 text-white'
              }`}
            >
              <div className="text-3xl font-bold">
                {entry.position}
              </div>
              <div className="text-3xl font-mono font-bold">
                {entry.bracelet_code}
              </div>
              <div className="flex items-center justify-center">
                <Clock className="w-6 h-6 mr-2" />
                <span className="text-2xl font-bold">
                  {new Date(entry.estimated_time).toLocaleTimeString('ru-RU', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Текущее время */}
      <div className="fixed bottom-8 right-8 text-right">
        <div className="text-gray-400 text-sm">Текущее время</div>
        <div className="text-2xl font-bold">
          {new Date().toLocaleTimeString('ru-RU', { 
            hour: '2-digit', 
            minute: '2-digit',
            second: '2-digit'
          })}
        </div>
      </div>
    </div>
  );
};
