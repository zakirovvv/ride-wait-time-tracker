
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { attractions } from '@/data/attractions';
import { useAttractionSettingsStore } from '@/stores/attractionSettingsStore';
import { useQueueStore } from '@/stores/queueStore';
import { toast } from '@/hooks/use-toast';
import { Settings, Timer, Save } from 'lucide-react';

export const AttractionSettings = () => {
  const { settings, updateDuration, getDuration } = useAttractionSettingsStore();
  const updateQueueSummary = useQueueStore(state => state.updateQueueSummary);
  const [tempSettings, setTempSettings] = useState<Record<string, string>>({});

  const handleDurationChange = (attractionId: string, value: string) => {
    setTempSettings(prev => ({
      ...prev,
      [attractionId]: value
    }));
  };

  const handleSave = (attractionId: string) => {
    const value = tempSettings[attractionId];
    if (!value || isNaN(Number(value)) || Number(value) <= 0) {
      toast({
        title: "Ошибка",
        description: "Введите корректное время (больше 0)",
        variant: "destructive"
      });
      return;
    }

    updateDuration(attractionId, Number(value));
    
    // Пересчитываем очереди с новым временем
    updateQueueSummary();
    
    setTempSettings(prev => {
      const newSettings = { ...prev };
      delete newSettings[attractionId];
      return newSettings;
    });

    toast({
      title: "Настройки сохранены",
      description: `Время для аттракциона обновлено и очереди пересчитаны`
    });
  };

  const handleReset = (attractionId: string) => {
    setTempSettings(prev => {
      const newSettings = { ...prev };
      delete newSettings[attractionId];
      return newSettings;
    });
  };

  return (
    <Card className="bg-white/95 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center text-2xl text-gray-800">
          <Settings className="w-6 h-6 mr-2 text-blue-600" />
          Настройка времени аттракционов
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {attractions.filter(a => a.isActive).map((attraction) => {
            const currentDuration = getDuration(attraction.id);
            const tempValue = tempSettings[attraction.id];
            const isEditing = tempValue !== undefined;

            return (
              <div key={attraction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">{attraction.icon}</span>
                  <div>
                    <div className="font-semibold text-gray-800">{attraction.name}</div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Timer className="w-3 h-3 mr-1" />
                      Текущее время: {currentDuration} мин
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {isEditing ? (
                    <>
                      <Input
                        type="number"
                        value={tempValue}
                        onChange={(e) => handleDurationChange(attraction.id, e.target.value)}
                        placeholder="Время в минутах"
                        className="w-24"
                        min="1"
                        max="60"
                      />
                      <Button
                        onClick={() => handleSave(attraction.id)}
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Save className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={() => handleReset(attraction.id)}
                        variant="outline"
                        size="sm"
                      >
                        Отмена
                      </Button>
                    </>
                  ) : (
                    <Button
                      onClick={() => handleDurationChange(attraction.id, currentDuration.toString())}
                      variant="outline"
                      size="sm"
                    >
                      Изменить
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
