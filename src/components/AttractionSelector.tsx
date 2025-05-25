import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { attractions } from '@/data/attractions';
import { CreditCard, Settings, Eye } from 'lucide-react';
interface AttractionSelectorProps {
  onAttractionSelect: (attractionId: string) => void;
  onRoleSelect: (role: 'visitor' | 'cashier' | 'operator') => void;
}

// Массив изображений для аттракционов в правильном порядке
const attractionImages = ['/lovable-uploads/4e621593-728c-4d3f-b758-ac47af2c1b71.png',
// 1) Прыжки с веревкой
'/lovable-uploads/d90e2c18-0d63-474d-a0ad-b4ab41f073e2.png',
// 2) Парные качели
'/lovable-uploads/bfb56542-ad55-4945-bdbe-23e5b147a37e.png',
// 3) Веревочный парк
'/lovable-uploads/fb4895e9-0890-4a53-b1d2-0d899df19acb.png',
// 4) Качели
'/lovable-uploads/ef96dd51-f393-4a54-bc8c-ebb65f550417.png',
// 5) Скалодром
'/lovable-uploads/5702511a-d0a3-48b7-a43b-b4765a60b250.png',
// 6) Мини-троллей
'/lovable-uploads/52a21e36-ac6c-403f-bd7e-c1291b3c5348.png',
// 7) Троллей
'/lovable-uploads/de689068-a78b-42e0-a997-06c7484035a2.png',
// 8) Спуск в грот
'/lovable-uploads/946fd121-8251-4571-8256-f748dd105d38.png',
// 9) Большой мост
'/lovable-uploads/f8cb5353-142e-4008-9505-721b648c9745.png',
// 10) Малый мост
null // 11) Вертолет - пока нет картинки
];
export const AttractionSelector = ({
  onAttractionSelect,
  onRoleSelect
}: AttractionSelectorProps) => {
  return <div className="min-h-screen bg-gradient-to-br from-green-600 via-blue-500 to-purple-600 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-4 drop-shadow-lg">🏞️ Grifon park</h1>
          <p className="text-xl text-white/90 drop-shadow">
            Выберите аттракцион для просмотра очереди
          </p>
        </div>

        {/* Сетка аттракционов */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
          {attractions.slice(0, 11).map((attraction, index) => {
          const imageUrl = attractionImages[index];
          return <Card key={attraction.id} className="bg-white/95 backdrop-blur-sm hover:bg-white transition-all duration-300 hover:scale-105 hover:shadow-xl border-0 cursor-pointer overflow-hidden" onClick={() => onAttractionSelect(attraction.id)}>
                <CardHeader className="pb-2">
                  <div className="text-center">
                    {imageUrl ? <div className="w-full mb-2 rounded-lg overflow-hidden">
                        <img src={imageUrl} alt={attraction.name} className="w-full h-auto object-contain" onError={e => {
                    console.log(`Failed to load image for ${attraction.name}`);
                    const target = e.currentTarget as HTMLImageElement;
                    const fallback = target.parentElement?.querySelector('.fallback-icon') as HTMLDivElement;
                    if (fallback) {
                      target.style.display = 'none';
                      fallback.style.display = 'flex';
                    }
                  }} />
                        <div className="fallback-icon w-full h-32 flex items-center justify-center text-4xl bg-gray-100" style={{
                    display: 'none'
                  }}>
                          {attraction.icon}
                        </div>
                      </div> : <div className="text-4xl mb-2">{attraction.icon}</div>}
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
              </Card>;
        })}
        </div>

        {/* Панель для посетителей */}
        
      </div>
    </div>;
};