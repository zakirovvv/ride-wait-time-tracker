
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { attractions } from '@/data/attractions';
import { CreditCard, Settings, Eye } from 'lucide-react';

interface AttractionSelectorProps {
  onAttractionSelect: (attractionId: string) => void;
  onRoleSelect: (role: 'visitor' | 'cashier' | 'operator') => void;
}

export const AttractionSelector = ({ onAttractionSelect, onRoleSelect }: AttractionSelectorProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-600 via-blue-500 to-purple-600 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-4 drop-shadow-lg">
            🏞️ Парк Приключений
          </h1>
          <p className="text-xl text-white/90 drop-shadow">
            Выберите аттракцион для просмотра очереди
          </p>
        </div>

        {/* Сетка аттракционов */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
          {attractions.map((attraction) => (
            <Card 
              key={attraction.id} 
              className="bg-white/95 backdrop-blur-sm hover:bg-white transition-all duration-300 hover:scale-105 hover:shadow-xl border-0 cursor-pointer"
              onClick={() => onAttractionSelect(attraction.id)}
            >
              <CardHeader className="pb-2">
                <div className="text-center">
                  <div className="text-4xl mb-2">{attraction.icon}</div>
                  <CardTitle className="text-lg text-gray-800 leading-tight">
                    {attraction.name}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-xs text-gray-600 text-center">
                  Длительность: {attraction.duration} мин
                </div>
                <div className="text-xs text-gray-600 text-center">
                  Вместимость: {attraction.capacity} чел
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Панель администрирования */}
        <Card className="bg-white/90 backdrop-blur-sm max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-center text-gray-800">
              Панель управления
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3">
              <Button
                onClick={() => onRoleSelect('visitor')}
                className="flex flex-col items-center gap-2 h-20 bg-purple-600 hover:bg-purple-700"
              >
                <Eye className="w-5 h-5" />
                <span className="text-xs">Посетители</span>
              </Button>
              
              <Button
                onClick={() => onRoleSelect('cashier')}
                className="flex flex-col items-center gap-2 h-20 bg-blue-600 hover:bg-blue-700"
              >
                <CreditCard className="w-5 h-5" />
                <span className="text-xs">Касса</span>
              </Button>
              
              <Button
                onClick={() => onRoleSelect('operator')}
                className="flex flex-col items-center gap-2 h-20 bg-orange-600 hover:bg-orange-700"
              >
                <Settings className="w-5 h-5" />
                <span className="text-xs">Оператор</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
