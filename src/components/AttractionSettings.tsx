
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSupabaseSettings } from '@/hooks/useSupabaseSettings';
import { attractions } from '@/data/attractions';
import { toast } from '@/hooks/use-toast';
import { Timer, RotateCcw, Save } from 'lucide-react';
import { useState } from 'react';

export const AttractionSettings = () => {
  const { settings, updateDuration, isLoading } = useSupabaseSettings();
  const [localSettings, setLocalSettings] = useState<Record<string, number>>({});
  const [isSaving, setIsSaving] = useState<Record<string, boolean>>({});

  const handleDurationChange = (attractionId: string, value: string) => {
    const duration = parseInt(value) || 1;
    setLocalSettings(prev => ({
      ...prev,
      [attractionId]: duration
    }));
  };

  const handleSave = async (attractionId: string) => {
    const newDuration = localSettings[attractionId];
    if (!newDuration || newDuration < 1) return;

    setIsSaving(prev => ({ ...prev, [attractionId]: true }));

    try {
      await updateDuration(attractionId, newDuration);
      
      // Очищаем локальное состояние после сохранения
      setLocalSettings(prev => {
        const { [attractionId]: _, ...rest } = prev;
        return rest;
      });

      toast({
        title: "Настройки сохранены!",
        description: `Длительность аттракциона обновлена: ${newDuration} мин`,
      });
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось сохранить настройки",
        variant: "destructive"
      });
    } finally {
      setIsSaving(prev => ({ ...prev, [attractionId]: false }));
    }
  };

  const getCurrentDuration = (attractionId: string) => {
    if (localSettings[attractionId] !== undefined) {
      return localSettings[attractionId];
    }
    const setting = settings.find(s => s.attraction_id === attractionId);
    return setting?.duration || attractions.find(a => a.id === attractionId)?.duration || 5;
  };

  const hasUnsavedChanges = (attractionId: string) => {
    return localSettings[attractionId] !== undefined;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-white text-xl">Загрузка настроек...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-white/95 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center text-2xl text-gray-800">
            <Timer className="w-6 h-6 mr-2 text-blue-600" />
            Настройки времени аттракционов
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {attractions.filter(a => a.isActive).map((attraction) => {
              const currentDuration = getCurrentDuration(attraction.id);
              const hasChanges = hasUnsavedChanges(attraction.id);
              const saving = isSaving[attraction.id];

              return (
                <Card key={attraction.id} className={`bg-gray-50 ${hasChanges ? 'ring-2 ring-blue-500' : ''}`}>
                  <CardHeader className="pb-3">
                    <div className="text-center">
                      <div className="text-3xl mb-2">{attraction.icon}</div>
                      <CardTitle className="text-lg">{attraction.name}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-sm text-gray-600">
                        Время на одного человека (мин)
                      </Label>
                      <div className="flex items-center space-x-2 mt-1">
                        <Input
                          type="number"
                          min="1"
                          max="60"
                          value={currentDuration}
                          onChange={(e) => handleDurationChange(attraction.id, e.target.value)}
                          className="text-center font-semibold"
                        />
                      </div>
                    </div>

                    {hasChanges && (
                      <div className="flex space-x-2">
                        <Button
                          onClick={() => handleSave(attraction.id)}
                          className="flex-1 bg-green-600 hover:bg-green-700"
                          size="sm"
                          disabled={saving}
                        >
                          <Save className="w-3 h-3 mr-1" />
                          {saving ? 'Сохранение...' : 'Сохранить'}
                        </Button>
                        <Button
                          onClick={() => setLocalSettings(prev => {
                            const { [attraction.id]: _, ...rest } = prev;
                            return rest;
                          })}
                          variant="outline"
                          size="sm"
                          disabled={saving}
                        >
                          <RotateCcw className="w-3 h-3" />
                        </Button>
                      </div>
                    )}

                    <div className="text-xs text-gray-500 text-center">
                      Базовая длительность: {attraction.duration} мин
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              💡 <strong>Совет:</strong> Изменения времени автоматически пересчитывают очереди для всех устройств в реальном времени.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
